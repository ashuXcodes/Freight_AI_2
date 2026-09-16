import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import { requireAuth } from './middleware/requireAuth.js';
import portRoutes from './routes/portRoutes.js';
import freightMarketRoutes from './routes/freightMarketRoutes.js';
import tradeLaneRoutes from './routes/tradeLaneRoutes.js';
import vesselRoutes from './routes/vesselRoutes.js';
import freightForecastRoutes from "./routes/freightForecastRoutes.js";
const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'freight-ai-api',
    timestamp: new Date().toISOString()
  });
});



app.use('/api/auth', authRoutes);

app.use('/api/vessels', requireAuth, vesselRoutes);
app.use('/api/ports', requireAuth, portRoutes);
app.use('/api/trade-lanes', requireAuth, tradeLaneRoutes);
app.use('/api/freight-market', requireAuth, freightMarketRoutes);
app.use('/api/freight-forecast', requireAuth, freightForecastRoutes);

app.use((_request, response) => {
  response.status(404).json({ error: 'API route not found.' });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    error: 'An unexpected server error occurred.'
  });
});

export default app;
