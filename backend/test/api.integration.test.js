import dotenv from 'dotenv';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

dotenv.config({ path: new URL('../.env', import.meta.url) });

function testDatabaseUri(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to run backend integration tests.');
  }

  const url = new URL(mongoUri);
  url.pathname = '/freight_ai_test';
  return url.toString();
}

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || testDatabaseUri(process.env.MONGODB_URI);
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-that-is-longer-than-thirty-two-characters';

const [
  { default: app },
  { connectDatabase, disconnectDatabase },
  { default: mongoose },
  { default: User },
  { default: Port },
  { default: VesselType },
  { default: TradeLane },
  { default: FreightForecast },
  { demoPorts },
  { demoVesselTypes },
  { demoTradeLanes },
  { demoFreightForecasts },
  { seedDemoTradeLanes },
  { seedDemoFreightForecasts }
] = await Promise.all([
  import('../src/app.js'),
  import('../src/config/database.js'),
  import('mongoose'),
  import('../src/models/User.js'),
  import('../src/models/Port.js'),
  import('../src/models/VesselType.js'),
  import('../src/models/TradeLane.js'),
  import('../src/models/FreightForecast.js'),
  import('../src/data/demoPorts.js'),
  import('../src/data/demoVesselTypes.js'),
  import('../src/data/demoTradeLanes.js'),
  import('../src/data/demoFreightForecasts.js'),
  import('../src/services/tradeLaneService.js'),
  import('../src/services/freightForecastService.js')
]);

async function seedCatalogue() {
  await Promise.all([
    Port.bulkWrite(demoPorts.map((port) => ({ updateOne: { filter: { portName: port.portName }, update: { $set: port }, upsert: true } }))),
    VesselType.bulkWrite(demoVesselTypes.map((vesselType) => ({ updateOne: { filter: { vesselType: vesselType.vesselType }, update: { $set: vesselType }, upsert: true } })))
  ]);
  await seedDemoTradeLanes(demoTradeLanes);
  await seedDemoFreightForecasts(demoFreightForecasts);
}

async function authenticatedAgent() {
  const agent = request.agent(app);
  const response = await agent.post('/api/auth/signup').send({
    name: 'Test Charterer',
    email: `test-${crypto.randomUUID()}@example.test`,
    password: 'test-password-123'
  });
  expect(response.status).toBe(201);
  return agent;
}

beforeAll(async () => {
  await connectDatabase(process.env.MONGODB_URI);
  expect(mongoose.connection.name).toBe('freight_ai_test');
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  // dropDatabase also removes the unique email index. Recreate schema indexes
  // before each isolated run so duplicate-account behavior matches production.
  await User.syncIndexes();
  await TradeLane.syncIndexes();
  await seedCatalogue();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await disconnectDatabase();
});

describe('FreightAI API integration', () => {
  it('reports public health information', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', service: 'freight-ai-api' });
    expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('signs up a user with an HttpOnly cookie and never exposes credentials', async () => {
    const response = await request(app).post('/api/auth/signup').send({
      name: 'Asha Kumar',
      email: 'asha@example.test',
      password: 'password123'
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({ name: 'Asha Kumar', email: 'asha@example.test' });
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('token');
    expect(response.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('HttpOnly')]));
    expect(await User.countDocuments({ email: 'asha@example.test' })).toBe(1);
  });

  it('validates signup input and rejects duplicate email addresses', async () => {
    const invalidResponse = await request(app).post('/api/auth/signup').send({ name: 'A', email: 'invalid', password: 'short' });
    expect(invalidResponse.status).toBe(400);

    const agent = request.agent(app);
    const payload = { name: 'Asha Kumar', email: 'duplicate@example.test', password: 'password123' };
    expect((await agent.post('/api/auth/signup').send(payload)).status).toBe(201);
    expect((await agent.post('/api/auth/signup').send(payload)).status).toBe(409);
  });

  it('logs in valid users and rejects wrong or unknown credentials', async () => {
    const agent = request.agent(app);
    const credentials = { name: 'Asha Kumar', email: 'login@example.test', password: 'password123' };
    await agent.post('/api/auth/signup').send(credentials);

    const loginResponse = await request(app).post('/api/auth/login').send({ email: credentials.email, password: credentials.password });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('HttpOnly')]));
    expect(loginResponse.body).not.toHaveProperty('passwordHash');

    expect((await request(app).post('/api/auth/login').send({ email: credentials.email, password: 'wrong-password' })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: 'missing@example.test', password: credentials.password })).status).toBe(401);
  });

  it('returns only safe user information from /api/auth/me', async () => {
    const agent = await authenticatedAgent();
    const response = await agent.get('/api/auth/me');

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ name: 'Test Charterer' });
    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(response.body.user).not.toHaveProperty('token');
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
  });

  it('enforces authentication for all protected API routes', async () => {
    const requests = [
      request(app).get('/api/ports'),
      request(app).get('/api/vessels'),
      request(app).get('/api/trade-lanes'),
      request(app).get('/api/trade-lanes/lookup').query({ originPort: 'Paradip', destinationPort: 'Newcastle' }),
      request(app).get('/api/freight-market/lookup').query({ originPort: 'Paradip', destinationPort: 'Newcastle', vesselType: 'Panamax' }),
      request(app).get('/api/freight-forecast/current'),
      request(app).post('/api/vessels/recommend').send({ cargoQuantity: 80000 }),
      request(app).post('/api/ports/compatibility').send({ originPort: 'Paradip', destinationPort: 'Haldia', vesselType: 'Handysize' })
    ];

    for (const protectedRequest of requests) {
      const response = await protectedRequest;
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Authentication is required.' });
    }
  });

  it('returns the protected market-wide BDI forecast without route-specific values', async () => {
    const response = await (await authenticatedAgent()).get('/api/freight-forecast/current');

    expect(response.status).toBe(200);
    expect(response.body.forecast).toMatchObject({
      isForecastAvailable: true,
      currentBdi: 3507,
      forecastBdi: 3400.22,
      absoluteChange: -106.78,
      percentageChange: -3.04,
      direction: 'FALLING',
      forecastHorizonObservations: 7,
      model: 'Linear Regression',
      featureCount: 33,
      dataClassification: 'DEMO / HISTORICAL-DATA MODEL'
    });
    expect(response.body.forecast).not.toHaveProperty('originPort');
    expect(response.body.forecast).not.toHaveProperty('destinationPort');
  });

  it('lists the complete, safe port catalogue for authenticated users', async () => {
    const response = await (await authenticatedAgent()).get('/api/ports');

    expect(response.status).toBe(200);
    expect(response.body.ports).toHaveLength(demoPorts.length);
    expect(response.body.ports.map((port) => port.name)).toEqual(expect.arrayContaining(['Paradip', 'Visakhapatnam', 'Gangavaram', 'Gopalpur', 'Dhamra', 'Sagar-Sandheads', 'Haldia']));
    expect(response.body.ports.map((port) => port.country)).toEqual(expect.arrayContaining(['India', 'Australia', 'United States', 'Mozambique', 'Indonesia']));
    expect(response.body.ports[0]).toEqual(expect.objectContaining({ id: expect.any(String), name: expect.any(String), country: expect.any(String), dataClassification: 'DEMO_PLACEHOLDER' }));
    expect(response.body.ports[0]).not.toHaveProperty('maximumDraft');
  });

  it('lists the complete, safe vessel catalogue for authenticated users', async () => {
    const response = await (await authenticatedAgent()).get('/api/vessels');

    expect(response.status).toBe(200);
    expect(response.body.vessels).toHaveLength(demoVesselTypes.length);
    expect(response.body.vessels.map((vessel) => vessel.vesselType)).toEqual(expect.arrayContaining(['Handysize', 'Handymax', 'Supramax', 'Panamax', 'Kamsarmax', 'Capesize']));
    expect(response.body.vessels[0]).toEqual(expect.objectContaining({ id: expect.any(String), vesselType: expect.any(String), dataClassification: 'DEMO_SAMPLE' }));
    expect(response.body.vessels[0]).not.toHaveProperty('typicalDraft');
  });

  it('lists and resolves protected demo trade lanes without exposing database references', async () => {
    const agent = await authenticatedAgent();
    const listResponse = await agent.get('/api/trade-lanes');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.tradeLanes).toHaveLength(demoTradeLanes.length);
    expect(listResponse.body.tradeLanes).toEqual(expect.arrayContaining([
      expect.objectContaining({ laneName: 'India → Australia', origin: { name: 'Paradip', country: 'India' }, destination: { name: 'Newcastle', country: 'Australia' } })
    ]));
    expect(listResponse.body.tradeLanes[0]).not.toHaveProperty('originPort');
    expect(listResponse.body.tradeLanes[0]).not.toHaveProperty('destinationPort');

    const lookupResponse = await agent.get('/api/trade-lanes/lookup').query({ originPort: 'paradip', destinationPort: 'NEWCASTLE' });
    expect(lookupResponse.status).toBe(200);
    expect(lookupResponse.body.tradeLane).toMatchObject({
      laneName: 'India → Australia',
      distanceNm: 5400,
      estimatedTransitDays: 16,
      preferredVesselTypes: expect.arrayContaining(['Panamax']),
      cargoTypes: expect.arrayContaining(['Thermal coal']),
      dataClassification: 'DEMO_PLACEHOLDER'
    });
  });

  it('validates trade-lane lookup, returns unknown ports as 404, and falls back safely for unseeded routes', async () => {
    const agent = await authenticatedAgent();

    const missingOrigin = await agent.get('/api/trade-lanes/lookup').query({ destinationPort: 'Newcastle' });
    expect(missingOrigin.status).toBe(400);
    expect(missingOrigin.body.invalidFields).toEqual(expect.arrayContaining(['originPort']));

    const samePort = await agent.get('/api/trade-lanes/lookup').query({ originPort: 'Paradip', destinationPort: 'paradip' });
    expect(samePort.status).toBe(400);

    const unknownPort = await agent.get('/api/trade-lanes/lookup').query({ originPort: 'Unknown Port', destinationPort: 'Newcastle' });
    expect(unknownPort.status).toBe(404);

    const unknownDestination = await agent.get('/api/trade-lanes/lookup').query({ originPort: 'Paradip', destinationPort: 'Unknown Port' });
    expect(unknownDestination.status).toBe(404);

    const fallbackResponse = await agent.get('/api/trade-lanes/lookup').query({ originPort: 'dhamra', destinationPort: 'LONG BEACH' });
    expect(fallbackResponse.status).toBe(200);
    expect(fallbackResponse.body.tradeLane).toMatchObject({
      id: null,
      origin: { name: 'Dhamra', country: 'India' },
      destination: { name: 'Long Beach', country: 'United States' },
      laneName: 'Dhamra → Long Beach',
      routeProfile: { originCountry: 'India', destinationCountry: 'United States', tradeDirection: 'International' },
      isDetailedLaneDataAvailable: false,
      dataClassification: 'DEMO_ESTIMATED'
    });
    expect(fallbackResponse.body.tradeLane).not.toHaveProperty('distanceNm');
    expect(fallbackResponse.body.tradeLane).not.toHaveProperty('estimatedTransitDays');
    expect(fallbackResponse.body.tradeLane).not.toHaveProperty('originPort');
    expect(fallbackResponse.body.tradeLane).not.toHaveProperty('destinationPort');

    const domesticFallback = await agent.get('/api/trade-lanes/lookup').query({ originPort: 'Haldia', destinationPort: 'Paradip' });
    expect(domesticFallback.status).toBe(200);
    expect(domesticFallback.body.tradeLane.routeProfile.tradeDirection).toBe('Domestic');
  });

  it('recommends Panamax first for 80,000 tonnes and validates invalid cargo values', async () => {
    const agent = await authenticatedAgent();
    const recommendation = await agent.post('/api/vessels/recommend').send({ cargoQuantity: 80000 });

    expect(recommendation.status).toBe(200);
    expect(recommendation.body).toMatchObject({ cargoQuantity: 80000, recommendationCount: expect.any(Number), dataClassification: 'DEMO_SAMPLE' });
    expect(recommendation.body.recommendations).not.toHaveLength(0);
    expect(recommendation.body.recommendations[0]).toMatchObject({ rank: 1, vesselType: 'Panamax' });

    for (const payload of [{}, { cargoQuantity: 0 }, { cargoQuantity: -1 }, { cargoQuantity: '80000' }]) {
      expect((await agent.post('/api/vessels/recommend').send(payload)).status).toBe(400);
    }
  });

  it('reports known incompatible and compatible destination assessments', async () => {
    const agent = await authenticatedAgent();
    const incompatible = await agent.post('/api/ports/compatibility').send({ originPort: 'Paradip', destinationPort: 'Haldia', vesselType: 'Handysize' });
    expect(incompatible.status).toBe(200);
    expect(incompatible.body).toMatchObject({ compatible: false, originPortConstraintsEvaluated: false });
    expect(incompatible.body.failedConstraints).toEqual(expect.arrayContaining([expect.objectContaining({ constraint: 'maximumDraft' })]));

    const compatible = await agent.post('/api/ports/compatibility').send({ originPort: 'Paradip', destinationPort: 'Gangavaram', vesselType: 'Handysize' });
    expect(compatible.status).toBe(200);
    expect(compatible.body).toMatchObject({ compatible: true, originPortConstraintsEvaluated: false });
    expect(compatible.body.failedConstraints).toHaveLength(0);
  });

  it('validates compatibility inputs and supports case-insensitive international lookups', async () => {
    const agent = await authenticatedAgent();
    const invalidResponse = await agent.post('/api/ports/compatibility').send({ originPort: '', destinationPort: 'Haldia' });
    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body.invalidFields).toEqual(expect.arrayContaining(['originPort', 'vesselType']));

    const response = await agent.post('/api/ports/compatibility').send({ originPort: 'port hedland', destinationPort: 'TANJUNG PRIOK', vesselType: 'handysize' });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ compatible: true, originPort: { country: 'Australia' }, destinationPort: { country: 'Indonesia' } });
  });

  it('logs out and revokes access to protected routes for that browser session', async () => {
    const agent = await authenticatedAgent();
    expect((await agent.get('/api/ports')).status).toBe(200);
    const logoutResponse = await agent.post('/api/auth/logout');
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('authToken=;')]));
    expect((await agent.get('/api/ports')).status).toBe(401);
  });
});
