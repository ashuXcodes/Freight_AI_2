import {
  describe,
  expect,
  it
} from 'vitest';

import {
  generateDecisionSupport
} from './decisionSupport.js';

const vessel = {
  vesselType: 'Panamax',
  suitability: 'TYPICAL_CAPACITY_MATCH'
};

const lane = {
  isDetailedLaneDataAvailable: true,
  dataClassification: 'DEMO_PLACEHOLDER'
};

const forecastRising = {
  isForecastAvailable: true,
  direction: 'RISING',
  dataClassification:
    'DEMO / HISTORICAL-DATA MODEL'
};

const forecastFalling = {
  isForecastAvailable: true,
  direction: 'FALLING',
  dataClassification:
    'DEMO / HISTORICAL-DATA MODEL'
};

const baseMarket = {
  isMarketDataAvailable: true,
  marketDirection: 'RISING',
  marketStrength: 'STRONG',
  dataClassification:
    'DEMO_PLACEHOLDER'
};

const base = (overrides = {}) => ({
  recommendation: {
    recommendations: [vessel]
  },

  compatibility: {
    compatible: true,
    failedConstraints: []
  },

  intelligence: {
    tradeLane: {
      status: 'fulfilled',
      value: lane
    },

    market: {
      status: 'fulfilled',
      value: baseMarket
    },

    forecast: {
      status: 'fulfilled',
      value: forecastRising
    }
  },

  ...overrides
});

const unavailableMarket = {
  status: 'fulfilled',

  value: {
    isMarketDataAvailable: false,
    dataClassification:
      'DEMO_PLACEHOLDER'
  }
};

describe(
  'generateDecisionSupport',
  () => {
    it(
      'returns BOOK_NOW only for aligned positive signals',
      () => {
        const result =
          generateDecisionSupport(base());

        expect(result.decision)
          .toBe('BOOK_NOW');

        expect(result.confidence)
          .toBe('MODERATE');

        expect(result.score)
          .toBe(100);
      }
    );

    it(
      'returns WAIT for aligned weakening market and BDI signals',
      () => {
        const result =
          generateDecisionSupport(
            base({
              intelligence: {
                ...base().intelligence,

                market: {
                  status: 'fulfilled',

                  value: {
                    isMarketDataAvailable: true,
                    marketDirection: 'FALLING',
                    marketStrength: 'WEAK'
                  }
                },

                forecast: {
                  status: 'fulfilled',
                  value: forecastFalling
                }
              }
            })
          );

        expect(result.decision)
          .toBe('WAIT');

        expect(result.confidence)
          .toBe('MODERATE');
      }
    );

    it(
      'does not return INSUFFICIENT_DATA merely because the exact market snapshot is unavailable',
      () => {
        const result =
          generateDecisionSupport(
            base({
              intelligence: {
                ...base().intelligence,

                market: unavailableMarket,

                forecast: {
                  status: 'fulfilled',
                  value: forecastFalling
                }
              }
            })
          );

        expect(result.decision)
          .toBe('WAIT');

        expect(result.confidence)
          .toBe('LOW');

        expect(result.score)
          .toBe(65);

        expect(
          result.dataQuality.freightMarket
        ).toBe('UNAVAILABLE');

        expect(
          result.cautionSignals.join(' ')
        ).toMatch(
          /exact route-and-vessel freight-market snapshot is unavailable/i
        );
      }
    );

    it(
      'reviews instead of booking when market data is unavailable but the BDI outlook is strengthening',
      () => {
        const result =
          generateDecisionSupport(
            base({
              intelligence: {
                ...base().intelligence,

                market: unavailableMarket,

                forecast: {
                  status: 'fulfilled',
                  value: forecastRising
                }
              }
            })
          );

        expect(result.decision)
          .toBe('REVIEW_REQUIRED');

        expect(result.decision)
          .not.toBe('BOOK_NOW');
      }
    );

    it(
      'never recommends booking when destination-side compatibility fails',
      () => {
        const result =
          generateDecisionSupport(
            base({
              compatibility: {
                compatible: false,

                failedConstraints: [
                  {
                    constraint: 'maximumDraft'
                  }
                ]
              }
            })
          );

        expect(result.decision)
          .toBe('REVIEW_REQUIRED');

        expect(
          result.blockingIssues[0]
        ).toMatch(
          /Draft constraint failed/i
        );
      }
    );

    it(
      'allows an estimated route profile to reduce confidence without treating it as a hard failure',
      () => {
        const result =
          generateDecisionSupport(
            base({
              intelligence: {
                ...base().intelligence,

                tradeLane: {
                  status: 'fulfilled',

                  value: {
                    isDetailedLaneDataAvailable:
                      false
                  }
                },

                market: {
                  status: 'fulfilled',

                  value: {
                    isMarketDataAvailable:
                      false
                  }
                },

                forecast: {
                  status: 'fulfilled',
                  value: forecastFalling
                }
              }
            })
          );

        expect(result.decision)
          .toBe('WAIT');

        expect(
          result.dataQuality.tradeLane
        ).toBe('ESTIMATED_DEMO');

        expect(result.confidence)
          .toBe('LOW');
      }
    );

    it(
      'does not recommend a multi-voyage contract without recurring-demand inputs',
      () => {
        const result =
          generateDecisionSupport(base());

        expect(result.decision)
          .not.toBe(
            'MULTI_VOYAGE_CONTRACT'
          );
      }
    );
  }
);