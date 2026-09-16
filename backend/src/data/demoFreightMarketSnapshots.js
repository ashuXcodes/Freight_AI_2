const demoDisclaimer =
  'Illustrative demo market data only. This is not a live freight quote, broker indication, or operational market forecast.';

export const demoFreightMarketSnapshots = [
  { originPortName: 'Paradip', destinationPortName: 'Newcastle', cargoType: 'Thermal coal', vesselType: 'Panamax', indicativeFreightRate: 24, freightRateUnit: 'USD/MT', marketDirection: 'RISING', marketStrength: 'STRONG', demandSignal: 'FIRM', vesselSupplySignal: 'TIGHT', commentary: 'Firm illustrative demand with relatively tight illustrative vessel supply is supporting a rising market signal.' },
  { originPortName: 'Paradip', destinationPortName: 'Haldia', cargoType: 'Thermal coal', vesselType: 'Handysize', indicativeFreightRate: 9, freightRateUnit: 'USD/MT', marketDirection: 'STABLE', marketStrength: 'MODERATE', demandSignal: 'BALANCED', vesselSupplySignal: 'BALANCED', commentary: 'Balanced illustrative demand and vessel supply support a stable market signal.' },
  { originPortName: 'Paradip', destinationPortName: 'Tanjung Priok', cargoType: 'Thermal coal', vesselType: 'Supramax', indicativeFreightRate: 16, freightRateUnit: 'USD/MT', marketDirection: 'FALLING', marketStrength: 'WEAK', demandSignal: 'SOFT', vesselSupplySignal: 'OPEN', commentary: 'Soft illustrative demand alongside open illustrative vessel supply is contributing to a falling market signal.' }
].map((snapshot) => ({
  ...snapshot,
  marketStatus: 'DEMO',
  dataClassification: 'DEMO_PLACEHOLDER',
  dataDisclaimer: demoDisclaimer,
  isActive: true
}));
