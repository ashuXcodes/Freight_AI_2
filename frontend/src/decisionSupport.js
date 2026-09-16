const DISCLAIMER =
  'Decision support is based on demo/estimated market intelligence and a historical-data BDI model. It is a prototype aid, not a live broker quote, operational clearance, guaranteed freight prediction, or commercial chartering advice.';

function valueOf(result) {
  return result?.status === 'fulfilled' ? result.value : null;
}

function makeDecision(
  decision,
  label,
  score,
  confidence,
  summary,
  reasons,
  positiveSignals,
  cautionSignals,
  blockingIssues,
  recommendedAction,
  dataQuality
) {
  return {
    decision,
    label,
    score: Math.max(0, Math.min(100, Math.round(score))),
    confidence,
    summary,
    reasons,
    positiveSignals,
    cautionSignals,
    blockingIssues,
    recommendedAction,
    dataQuality,
    disclaimer: DISCLAIMER
  };
}

function quality(topVessel, compatibility, lane, market, forecast) {
  return {
    vessel: topVessel ? 'AVAILABLE' : 'UNAVAILABLE',

    port: compatibility ? 'AVAILABLE' : 'UNAVAILABLE',

    tradeLane: lane
      ? lane.isDetailedLaneDataAvailable === false
        ? 'ESTIMATED_DEMO'
        : 'DETAILED_DEMO'
      : 'UNAVAILABLE',

    freightMarket: market?.isMarketDataAvailable
      ? 'EXACT_DEMO_SNAPSHOT'
      : 'UNAVAILABLE',

    bdiForecast: forecast?.isForecastAvailable
      ? 'AVAILABLE_HISTORICAL_MODEL'
      : 'UNAVAILABLE'
  };
}

export function generateDecisionSupport(analysis) {
  const topVessel =
    analysis?.recommendation?.recommendations?.[0];

  const compatibility = analysis?.compatibility;

  const lane = valueOf(
    analysis?.intelligence?.tradeLane
  );

  const market = valueOf(
    analysis?.intelligence?.market
  );

  const forecast = valueOf(
    analysis?.intelligence?.forecast
  );

  const dataQuality = quality(
    topVessel,
    compatibility,
    lane,
    market,
    forecast
  );

  const commonCautions = [
    'Destination-side dimensional checks do not represent complete port clearance.',
    'Multi-voyage contracting is not assessed because recurring demand, shipment frequency, and contract-horizon inputs are unavailable.'
  ];

  /*
   * ---------------------------------------------------------
   * HARD CONSTRAINTS
   * ---------------------------------------------------------
   *
   * These rules always override market signals.
   */

  if (!topVessel) {
    return makeDecision(
      'REVIEW_REQUIRED',
      'Review Required',
      0,
      'LOW',
      'No suitable vessel was identified for the entered cargo requirement.',
      [
        'No suitable vessel recommendation is available.'
      ],
      [],
      commonCautions,
      [
        'A vessel capacity match is required before commercial action can be assessed.'
      ],
      'Review cargo sizing or obtain an appropriate vessel option, then reassess.',
      dataQuality
    );
  }

  if (!compatibility?.compatible) {
    const failed =
      compatibility?.failedConstraints?.map(
        (item) =>
          `${item.constraint.replace(
            'maximum',
            ''
          )} constraint failed.`
      );

    return makeDecision(
      'REVIEW_REQUIRED',
      'Review Required',
      0,
      'LOW',
      'Destination-side vessel constraints did not pass the available compatibility check.',
      [
        'The destination-side vessel compatibility check did not pass.'
      ],
      [],
      commonCautions,
      failed?.length
        ? failed
        : [
            'Destination-side compatibility did not pass.'
          ],
      'Review the destination-side vessel constraints before considering commercial commitment.',
      dataQuality
    );
  }

  /*
   * ---------------------------------------------------------
   * BASE VOYAGE SIGNALS
   * ---------------------------------------------------------
   */

  const typicalMatch =
    topVessel.suitability ===
    'TYPICAL_CAPACITY_MATCH';

  let score = typicalMatch ? 25 : 15;

  const positiveSignals = [
    `Recommended ${topVessel.vesselType} is a ${
      typicalMatch
        ? 'typical'
        : 'technically available oversized'
    } capacity match.`,
    'Destination-side compatibility check passed.'
  ];

  const reasons = [...positiveSignals];

  const cautionSignals = [
    ...commonCautions
  ];

  /*
   * Passing destination-side compatibility
   * contributes positively to the signal score.
   */
  score += 25;

  /*
   * ---------------------------------------------------------
   * TRADE-LANE SIGNAL
   * ---------------------------------------------------------
   *
   * Detailed demo lane:
   *   positive with stronger confidence
   *
   * Estimated route:
   *   positive but weaker
   *
   * Unavailable:
   *   neutral / missing information
   */

  if (
    lane?.isDetailedLaneDataAvailable !== false &&
    lane
  ) {
    score += 15;

    positiveSignals.push(
      'Detailed seeded/demo trade-lane data is available.'
    );

    reasons.push(
      'Detailed seeded/demo trade-lane data is available.'
    );
  } else if (lane) {
    score += 8;

    cautionSignals.unshift(
      'Only an estimated route profile is available; it is not treated as validated operational data.'
    );

    reasons.push(
      'An estimated demo route profile is available for the selected ports.'
    );
  } else {
    cautionSignals.unshift(
      'Trade-lane intelligence is unavailable.'
    );
  }

  /*
   * ---------------------------------------------------------
   * FREIGHT MARKET SIGNAL
   * ---------------------------------------------------------
   *
   * Only use an exact route + vessel snapshot.
   *
   * Never fabricate a missing snapshot.
   */

  const hasMarket =
    market?.isMarketDataAvailable === true;

  const hasForecast =
    forecast?.isForecastAvailable === true;

  const strongRisingMarket =
    hasMarket &&
    market.marketDirection === 'RISING' &&
    market.marketStrength === 'STRONG';

  const weakFallingMarket =
    hasMarket &&
    market.marketDirection === 'FALLING' &&
    market.marketStrength === 'WEAK';

  const neutralMarket =
    hasMarket &&
    market.marketDirection === 'STABLE' &&
    market.marketStrength === 'MODERATE';

  if (hasMarket) {
    score +=
      strongRisingMarket || weakFallingMarket
        ? 20
        : 12;

    reasons.push(
      `Illustrative route-and-vessel market snapshot is ${market.marketDirection} / ${market.marketStrength}.`
    );

    cautionSignals.unshift(
      'Freight market intelligence is illustrative demo data, not a live broker quote or fixture price.'
    );
  } else {
    /*
     * Missing direct market data reduces the score,
     * but does NOT automatically block a decision.
     */
    score -= 15;

    cautionSignals.unshift(
      'Exact route-and-vessel freight-market snapshot is unavailable.'
    );
  }

  /*
   * ---------------------------------------------------------
   * BDI SIGNAL
   * ---------------------------------------------------------
   *
   * BDI is market-wide.
   *
   * It is NOT converted into a route-specific
   * freight-rate prediction.
   */

  if (hasForecast) {
    score += 15;

    const bdiMeaning =
      forecast.direction === 'FALLING'
        ? 'showing a weakening signal'
        : forecast.direction === 'RISING'
          ? 'showing a strengthening signal'
          : 'showing a broadly stable signal';

    reasons.push(
      `Market-wide BDI outlook is ${forecast.direction}: dry-bulk conditions are ${bdiMeaning}.`
    );

    cautionSignals.unshift(
      'The BDI outlook is market-wide and historical-model based; it is not a route-specific freight-rate forecast.'
    );
  } else {
    cautionSignals.unshift(
      'The market-wide BDI outlook is unavailable.'
    );
  }

  /*
   * ---------------------------------------------------------
   * CASE 1
   * Missing direct freight market +
   * available falling BDI
   *
   * This is the important fix.
   *
   * Previously:
   *   -> INSUFFICIENT_DATA
   *
   * Now:
   *   -> WAIT with LOW confidence
   */

  if (
    !hasMarket &&
    hasForecast &&
    forecast.direction === 'FALLING'
  ) {
    return makeDecision(
      'WAIT',
      'Wait',
      score,
      'LOW',
      'The selected vessel and destination-side compatibility checks are acceptable, and the market-wide BDI outlook shows a weakening signal. The missing exact market snapshot makes this a low-confidence monitoring recommendation.',
      reasons,
      positiveSignals,
      cautionSignals,
      [],
      'Monitor current freight-market conditions and reassess before committing. This does not guarantee a lower freight rate.',
      dataQuality
    );
  }

  /*
   * ---------------------------------------------------------
   * CASE 2
   * Direct market = FALLING / WEAK
   * and BDI is FALLING or STABLE
   */

  if (
    weakFallingMarket &&
    (
      !hasForecast ||
      forecast.direction === 'FALLING' ||
      forecast.direction === 'STABLE'
    )
  ) {
    return makeDecision(
      'WAIT',
      'Wait',
      hasForecast ? score : score - 5,
      hasForecast ? 'MODERATE' : 'LOW',
      'Available illustrative market signals favor monitoring conditions before committing.',
      reasons,
      positiveSignals,
      cautionSignals,
      [],
      'Monitor current freight-market conditions and reassess before committing. This does not guarantee a lower freight rate.',
      dataQuality
    );
  }

  /*
   * ---------------------------------------------------------
   * CASE 3
   * Direct market = STABLE / MODERATE
   * and BDI = FALLING or STABLE
   */

  if (
    neutralMarket &&
    hasForecast &&
    (
      forecast.direction === 'FALLING' ||
      forecast.direction === 'STABLE'
    )
  ) {
    return makeDecision(
      'WAIT',
      'Wait',
      score,
      'MODERATE',
      'The direct market snapshot is neutral and the market-wide outlook provides no strong reason to secure freight immediately.',
      reasons,
      positiveSignals,
      cautionSignals,
      [],
      'Monitor current freight-market conditions and reassess before committing.',
      dataQuality
    );
  }

  /*
   * ---------------------------------------------------------
   * CASE 4
   * Direct market = RISING / STRONG
   * and BDI = RISING or STABLE
   *
   * This can support BOOK_NOW.
   */

  if (
    strongRisingMarket &&
    hasForecast &&
    (
      forecast.direction === 'RISING' ||
      forecast.direction === 'STABLE'
    )
  ) {
    return makeDecision(
      'BOOK_NOW',
      'Book Now',
      score,
      'MODERATE',
      'Capacity, destination-side compatibility, detailed route intelligence, and aligned illustrative market signals support timely commercial review.',
      reasons,
      positiveSignals,
      cautionSignals,
      [],
      'Consider securing the voyage while available market signals indicate stronger conditions; validate live operational, port, and broker inputs before any commitment.',
      dataQuality
    );
  }

  /*
   * ---------------------------------------------------------
   * CONFLICTING / INCOMPLETE SIGNALS
   * ---------------------------------------------------------
   */

  if (
    strongRisingMarket &&
    hasForecast &&
    forecast.direction === 'FALLING'
  ) {
    cautionSignals.unshift(
      'The direct market snapshot is rising/strong while the market-wide BDI outlook is weakening.'
    );
  } else if (
    !hasMarket &&
    hasForecast
  ) {
    cautionSignals.unshift(
      'The available BDI signal does not provide enough route-specific evidence for a booking recommendation.'
    );
  } else if (
    !hasForecast &&
    strongRisingMarket
  ) {
    cautionSignals.unshift(
      'The direct market snapshot is strong, but the market-wide BDI outlook is unavailable.'
    );
  } else {
    cautionSignals.unshift(
      'Available market signals do not provide a clear, aligned Book Now or Wait indication.'
    );
  }

  return makeDecision(
    'REVIEW_REQUIRED',
    'Review Required',
    score,
    'LOW',
    'The available signals are incomplete or materially conflicting, so the rules cannot support a conservative commercial-action recommendation.',
    reasons,
    positiveSignals,
    cautionSignals,
    [],
    'Review current market and operational inputs before making a commercial commitment.',
    dataQuality
  );
}