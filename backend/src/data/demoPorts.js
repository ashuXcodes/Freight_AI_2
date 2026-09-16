const demoDisclaimer =
  'DEMO/PLACEHOLDER infrastructure values only. These values are illustrative and are not real port specifications or operational guidance.';

// Intentionally illustrative values for development; validate against authoritative port data before any real-world use.
export const demoPorts = [
  { portName: 'Paradip', maximumDraft: 14, maximumLOA: 260, maximumBeam: 40, cargoHandlingRate: 45000 },
  { portName: 'Visakhapatnam', maximumDraft: 15, maximumLOA: 280, maximumBeam: 42, cargoHandlingRate: 50000 },
  { portName: 'Gangavaram', maximumDraft: 16, maximumLOA: 300, maximumBeam: 45, cargoHandlingRate: 55000 },
  { portName: 'Gopalpur', maximumDraft: 12.5, maximumLOA: 225, maximumBeam: 32.5, cargoHandlingRate: 20000 },
  { portName: 'Dhamra', maximumDraft: 16, maximumLOA: 300, maximumBeam: 45, cargoHandlingRate: 50000 },
  { portName: 'Sagar-Sandheads', maximumDraft: 10.5, maximumLOA: 200, maximumBeam: 32, cargoHandlingRate: 15000 },
  { portName: 'Haldia', maximumDraft: 8.5, maximumLOA: 185, maximumBeam: 30, cargoHandlingRate: 10000 },

  // Australia — illustrative demo values only.
  { portName: 'Port Hedland', country: 'Australia', maximumDraft: 18, maximumLOA: 320, maximumBeam: 50, cargoHandlingRate: 70000 },
  { portName: 'Newcastle', country: 'Australia', maximumDraft: 16, maximumLOA: 300, maximumBeam: 45, cargoHandlingRate: 60000 },
  { portName: 'Gladstone', country: 'Australia', maximumDraft: 17, maximumLOA: 310, maximumBeam: 48, cargoHandlingRate: 65000 },
  { portName: 'Hay Point', country: 'Australia', maximumDraft: 18.5, maximumLOA: 330, maximumBeam: 52, cargoHandlingRate: 75000 },
  { portName: 'Dampier', country: 'Australia', maximumDraft: 17.5, maximumLOA: 315, maximumBeam: 50, cargoHandlingRate: 68000 },

  // United States — illustrative demo values only.
  { portName: 'Houston', country: 'United States', maximumDraft: 14, maximumLOA: 290, maximumBeam: 43, cargoHandlingRate: 55000 },
  { portName: 'New Orleans', country: 'United States', maximumDraft: 13.5, maximumLOA: 280, maximumBeam: 42, cargoHandlingRate: 50000 },
  { portName: 'Long Beach', country: 'United States', maximumDraft: 16, maximumLOA: 320, maximumBeam: 50, cargoHandlingRate: 60000 },
  { portName: 'Corpus Christi', country: 'United States', maximumDraft: 15, maximumLOA: 300, maximumBeam: 45, cargoHandlingRate: 52000 },
  { portName: 'Savannah', country: 'United States', maximumDraft: 13, maximumLOA: 275, maximumBeam: 42, cargoHandlingRate: 45000 },

  // Mozambique — illustrative demo values only.
  { portName: 'Maputo', country: 'Mozambique', maximumDraft: 13, maximumLOA: 260, maximumBeam: 40, cargoHandlingRate: 35000 },
  { portName: 'Beira', country: 'Mozambique', maximumDraft: 11.5, maximumLOA: 230, maximumBeam: 36, cargoHandlingRate: 25000 },
  { portName: 'Nacala', country: 'Mozambique', maximumDraft: 15, maximumLOA: 285, maximumBeam: 43, cargoHandlingRate: 40000 },

  // Indonesia — illustrative demo values only.
  { portName: 'Tanjung Priok', country: 'Indonesia', maximumDraft: 14, maximumLOA: 290, maximumBeam: 43, cargoHandlingRate: 50000 },
  { portName: 'Tanjung Jati', country: 'Indonesia', maximumDraft: 13, maximumLOA: 270, maximumBeam: 40, cargoHandlingRate: 35000 },
  { portName: 'Balikpapan', country: 'Indonesia', maximumDraft: 14.5, maximumLOA: 280, maximumBeam: 42, cargoHandlingRate: 42000 },
  { portName: 'Samarinda', country: 'Indonesia', maximumDraft: 11, maximumLOA: 220, maximumBeam: 34, cargoHandlingRate: 28000 }
].map((port) => ({
  ...port,
  country: port.country ?? 'India',
  dataClassification: 'DEMO_PLACEHOLDER',
  dataDisclaimer: demoDisclaimer
}));
