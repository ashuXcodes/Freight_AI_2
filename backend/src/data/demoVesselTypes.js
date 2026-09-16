const demoDisclaimer =
  'Demo/sample data only. Values are illustrative and must not be used as authoritative vessel specifications or for operational chartering decisions.';

// Illustrative values for application development. They are intentionally labelled as demo data.
export const demoVesselTypes = [
  {
    vesselType: 'Handysize',
    minimumTypicalCargoCapacity: 15000,
    maximumTypicalCargoCapacity: 35000,
    typicalDraft: 10.5,
    typicalLOA: 180,
    typicalBeam: 30
  },
  {
    vesselType: 'Handymax',
    minimumTypicalCargoCapacity: 35000,
    maximumTypicalCargoCapacity: 55000,
    typicalDraft: 12,
    typicalLOA: 200,
    typicalBeam: 32
  },
  {
    vesselType: 'Supramax',
    minimumTypicalCargoCapacity: 50000,
    maximumTypicalCargoCapacity: 60000,
    typicalDraft: 12.5,
    typicalLOA: 200,
    typicalBeam: 32
  },
  {
    vesselType: 'Panamax',
    minimumTypicalCargoCapacity: 60000,
    maximumTypicalCargoCapacity: 80000,
    typicalDraft: 13,
    typicalLOA: 225,
    typicalBeam: 32.5
  },
  {
    vesselType: 'Kamsarmax',
    minimumTypicalCargoCapacity: 80000,
    maximumTypicalCargoCapacity: 85000,
    typicalDraft: 13.5,
    typicalLOA: 229,
    typicalBeam: 32.5
  },
  {
    vesselType: 'Capesize',
    minimumTypicalCargoCapacity: 120000,
    maximumTypicalCargoCapacity: 180000,
    typicalDraft: 17,
    typicalLOA: 290,
    typicalBeam: 45
  }
].map((vesselType) => ({
  ...vesselType,
  dataClassification: 'DEMO_SAMPLE',
  dataDisclaimer: demoDisclaimer
}));
