import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dashboard } from './App.jsx';
import VoyageResults from './VoyageResults.jsx';

const ports = [
  { id: 'port-1', name: 'Paradip', country: 'India' },
  { id: 'port-2', name: 'Haldia', country: 'India' }
];
const vessels = [{ id: 'vessel-1', vesselType: 'Handysize' }];
const lane = { laneName: 'Paradip → Haldia', origin: { name: 'Paradip' }, destination: { name: 'Haldia' }, distanceNm: 250, estimatedTransitDays: 1, preferredVesselTypes: ['Handysize'], cargoTypes: ['Thermal coal'], dataClassification: 'DEMO_PLACEHOLDER', dataDisclaimer: 'Illustrative only.' };
const recommendation = { cargoQuantity: 80000, recommendationCount: 1, dataDisclaimer: 'Illustrative only.', recommendations: [{ rank: 1, vesselType: 'Panamax', suitability: 'TYPICAL_CAPACITY_MATCH', minimumTypicalCargoCapacity: 60000, maximumTypicalCargoCapacity: 80000, capacitySurplus: 0, typicalDraft: 13, typicalLOA: 225, typicalBeam: 32.5 }] };
const compatibility = { compatible: false, reasons: ['Draft exceeds the demo destination limit.'], originPort: { portName: 'Paradip' }, destinationPort: { portName: 'Haldia', maximumDraft: 8.5, maximumLOA: 185, maximumBeam: 30 }, vesselType: { vesselType: 'Handysize', typicalDraft: 10.5, typicalLOA: 180, typicalBeam: 30 }, failedConstraints: [{ constraint: 'maximumDraft' }], originPortConstraintsEvaluated: false };
const forecast = { isForecastAvailable: true, currentBdi: 3507, forecastBdi: 3400.22, absoluteChange: -106.78, percentageChange: -3.04, direction: 'FALLING', forecastHorizonObservations: 7, model: 'Linear Regression', featureCount: 33, dataClassification: 'DEMO / HISTORICAL-DATA MODEL', dataDisclaimer: 'Historical data only.' };

function response(body, status = 200) { return Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body }); }

describe('Voyage analysis flow', () => {
  it('loads the planning catalogue and passes collected results to the dedicated results route', async () => {
    const onAnalysisReady = vi.fn();
    vi.stubGlobal('fetch', vi.fn()
      .mockImplementationOnce(() => response({ ports }))
      .mockImplementationOnce(() => response({ vessels }))
      .mockImplementationOnce(() => response({ tradeLane: lane }))
      .mockImplementationOnce(() => response(recommendation))
      .mockImplementationOnce(() => response(compatibility))
      .mockImplementationOnce(() => response({ tradeLane: lane }))
      .mockImplementationOnce(() => response({ market: { isMarketDataAvailable: false } }))
      .mockImplementationOnce(() => response({ forecast })));
    render(<Dashboard user={{ name: 'Asha Kumar', email: 'asha@example.test' }} onLogout={vi.fn()} onAnalysisReady={onAnalysisReady} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Analyze Voyage' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Analyze Voyage' }));
    await waitFor(() => expect(onAnalysisReady).toHaveBeenCalledOnce());
    expect(onAnalysisReady.mock.calls[0][0]).toMatchObject({ form: { originPort: 'Paradip', destinationPort: 'Haldia', cargoQuantity: 80000 }, recommendation, compatibility });
  });

  it('renders the report sections and keeps the BDI outlook market-wide', () => {
    render(<VoyageResults user={{ name: 'Asha Kumar', email: 'asha@example.test' }} onLogout={vi.fn()} onBack={vi.fn()} analysis={{ form: { originPort: 'Australia', destinationPort: 'Paradip', cargoQuantity: 80000, vesselType: 'Handysize' }, recommendation, compatibility, intelligence: { tradeLane: { status: 'fulfilled', value: lane }, market: { status: 'fulfilled', value: { isMarketDataAvailable: false } }, forecast: { status: 'fulfilled', value: forecast } } }} />);
    expect(screen.getByRole('heading', { name: 'Voyage Analysis' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Market-wide BDI Outlook' })).toBeInTheDocument();
    expect(screen.getByText(/not a route freight forecast/)).toBeInTheDocument();
    expect(screen.getByText('3,400.22')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Back to Voyage Planning/ })).toHaveLength(2);
  });
});
