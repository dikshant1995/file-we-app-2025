/**
 * BT Comparison Service - Compare banks and determine best offers
 * 
 * This service analyzes BT results and provides intelligent recommendations
 * on which bank is best and why for different customer priorities
 */

/**
 * Compare BT results and find best banks for different criteria
 * @param {Array} btResults - Results from BT calculation (any scenario)
 * @returns {Object} Comprehensive comparison with recommendations
 */
export const compareBTResults = (btResults) => {
  // Filter only eligible banks (handle both possible flag names)
  const eligibleBanks = btResults.filter(bank => bank.eligible || bank.isEligible);

  if (eligibleBanks.length === 0) {
    return {
      hasEligibleBanks: false,
      totalBanks: btResults.length,
      eligibleCount: 0,
      rejectedCount: btResults.length,
      message: 'No banks eligible for Balance Transfer with current profile',
      rejectionReasons: btResults.map(bank => ({
        bankName: bank.bankName,
        reason: bank.reason
      }))
    };
  }

  // Find best banks for different criteria
  const bestForFreshFunds = findBestByFreshFunds(eligibleBanks);
  const bestForLowEMI = findBestByEMI(eligibleBanks);
  const bestForLowInterest = findBestByInterestRate(eligibleBanks);
  const bestOverall = findBestOverall(eligibleBanks);

  // Calculate savings comparison
  const savingsComparison = calculateSavingsComparison(eligibleBanks);

  // Generate detailed bank rankings
  const bankRankings = generateBankRankings(eligibleBanks);

  return {
    hasEligibleBanks: true,
    totalBanks: btResults.length,
    eligibleCount: eligibleBanks.length,
    rejectedCount: btResults.length - eligibleBanks.length,

    // Best banks for different criteria
    recommendations: {
      bestForFreshFunds,
      bestForLowEMI,
      bestForLowInterest,
      bestOverall
    },

    // Detailed comparisons
    savingsComparison,
    bankRankings,

    // All eligible banks
    allEligibleBanks: eligibleBanks,

    // Rejection summary
    rejectedBanks: btResults.filter(bank => !bank.isEligible).map(bank => ({
      bankName: bank.bankName,
      reason: bank.reason
    }))
  };
};

/**
 * Find best bank by fresh funds (highest disbursement)
 */
const findBestByFreshFunds = (eligibleBanks) => {
  const best = eligibleBanks.reduce((max, bank) =>
    bank.freshAmountDisbursed > max.freshAmountDisbursed ? bank : max
  );

  const worst = eligibleBanks.reduce((min, bank) =>
    bank.freshAmountDisbursed < min.freshAmountDisbursed ? bank : min
  );

  const difference = best.freshAmountDisbursed - worst.freshAmountDisbursed;

  return {
    bank: best,
    metric: 'Maximum Fresh Funds',
    value: `₹${best.freshAmountDisbursed.toLocaleString()}`,
    advantage: `₹${difference.toLocaleString()} more than lowest offer`,
    why: `${best.bankName} offers the highest fresh cash disbursement, giving you maximum liquidity for your needs. This is ideal if you need substantial funds for expenses, investments, or other purposes.`,
    score: 100,
    badgeColor: '#28a745'
  };
};

/**
 * Find best bank by lowest EMI (monthly payment)
 */
const findBestByEMI = (eligibleBanks) => {
  const best = eligibleBanks.reduce((min, bank) => {
    const emi = bank.newSingleEMI || bank.newBTLoanEMI;
    const minEmi = min.newSingleEMI || min.newBTLoanEMI;
    return emi < minEmi ? bank : min;
  });

  const worst = eligibleBanks.reduce((max, bank) => {
    const emi = bank.newSingleEMI || bank.newBTLoanEMI;
    const maxEmi = max.newSingleEMI || max.newBTLoanEMI;
    return emi > maxEmi ? bank : max;
  });

  const bestEMI = best.newSingleEMI || best.newBTLoanEMI;
  const worstEMI = worst.newSingleEMI || worst.newBTLoanEMI;
  const difference = worstEMI - bestEMI;

  return {
    bank: best,
    metric: 'Lowest Monthly EMI',
    value: `₹${bestEMI.toLocaleString()}`,
    advantage: `₹${difference.toLocaleString()} less per month than highest EMI`,
    why: `${best.bankName} requires the lowest monthly payment, reducing your monthly financial burden. Best choice if you want to maximize monthly cash flow and maintain a comfortable budget.`,
    score: 95,
    badgeColor: '#007bff'
  };
};

/**
 * Find best bank by lowest interest rate
 * Note: If all banks use the same interest rate (11%), this will show tied results
 */
const findBestByInterestRate = (eligibleBanks) => {
  const best = eligibleBanks.reduce((min, bank) =>
    bank.interestRate < min.interestRate ? bank : min
  );

  const worst = eligibleBanks.reduce((max, bank) =>
    bank.interestRate > max.interestRate ? bank : max
  );

  const difference = worst.interestRate - best.interestRate;

  // Check if all banks have the same rate
  const allSameRate = difference === 0;

  // Calculate total interest savings over loan tenure
  const tenure = best.tenure || 5;
  const emi = best.newSingleEMI || best.newBTLoanEMI;
  const totalPayment = emi * tenure * 12;
  const principal = best.maxLoanAmount;
  const interestPaid = totalPayment - principal;

  return {
    bank: best,
    metric: allSameRate ? 'Standard Interest Rate' : 'Lowest Interest Rate',
    value: `${best.interestRate}% p.a.`,
    advantage: allSameRate ? 'Same rate for all banks' : `${difference.toFixed(2)}% lower than highest rate`,
    why: allSameRate
      ? `All banks use ${best.interestRate}% interest rate. The key differences are in fresh funds disbursed and monthly EMI amounts. Choose based on your cash flow needs.`
      : `${best.bankName} offers the most competitive interest rate, minimizing your total interest cost over the loan tenure. You'll save approximately ₹${Math.round(interestPaid * 0.1).toLocaleString()} compared to higher rate options.`,
    score: 90,
    badgeColor: '#17a2b8',
    allSameRate: allSameRate
  };
};

/**
 * Find best overall bank (weighted scoring)
 * Note: If all banks use same interest rate, rate score won't differentiate
 */
const findBestOverall = (eligibleBanks) => {
  // Calculate weighted score for each bank
  const scoredBanks = eligibleBanks.map(bank => {
    const emi = bank.newSingleEMI || bank.newBTLoanEMI;

    // Normalize values (0-100 scale)
    const maxFresh = Math.max(...eligibleBanks.map(b => b.freshAmountDisbursed));
    const minEMI = Math.min(...eligibleBanks.map(b => b.newSingleEMI || b.newBTLoanEMI));
    const maxEMI = Math.max(...eligibleBanks.map(b => b.newSingleEMI || b.newBTLoanEMI));
    const minRate = Math.min(...eligibleBanks.map(b => b.interestRate));
    const maxRate = Math.max(...eligibleBanks.map(b => b.interestRate));

    // Check if all banks have same interest rate
    const allSameRate = maxRate === minRate;

    // Scoring (higher is better)
    const freshScore = (bank.freshAmountDisbursed / maxFresh) * 100;
    const emiScore = maxEMI === minEMI ? 100 : ((maxEMI - emi) / (maxEMI - minEMI)) * 100;
    const rateScore = allSameRate ? 100 : (maxRate === minRate ? 100 : ((maxRate - bank.interestRate) / (maxRate - minRate)) * 100);

    // Weighted average
    // If all banks have same rate, give more weight to fresh funds and EMI
    let totalScore;
    if (allSameRate) {
      // 60% fresh funds, 40% EMI (no rate differentiation)
      totalScore = (freshScore * 0.60) + (emiScore * 0.40);
    } else {
      // Original: 40% fresh funds, 35% EMI, 25% rate
      totalScore = (freshScore * 0.40) + (emiScore * 0.35) + (rateScore * 0.25);
    }

    return {
      bank,
      score: totalScore,
      breakdown: {
        freshScore: Math.round(freshScore),
        emiScore: Math.round(emiScore),
        rateScore: Math.round(rateScore)
      },
      allSameRate: allSameRate
    };
  });

  // Find highest scoring bank
  const best = scoredBanks.reduce((max, current) =>
    current.score > max.score ? current : max
  );

  const whyText = best.allSameRate
    ? `${best.bank.bankName} provides the best overall balance. Since all banks use ${best.bank.interestRate}% interest rate, we focus on fresh funds (60% weight) and EMI affordability (40% weight). Fresh Funds Score: ${best.breakdown.freshScore}/100, EMI Score: ${best.breakdown.emiScore}/100. This is the smartest choice for most customers.`
    : `${best.bank.bankName} provides the best overall balance across all key factors. Fresh Funds Score: ${best.breakdown.freshScore}/100, EMI Score: ${best.breakdown.emiScore}/100, Rate Score: ${best.breakdown.rateScore}/100. This is the smartest choice for most customers.`;

  return {
    bank: best.bank,
    metric: 'Best Overall Balance',
    value: `Score: ${Math.round(best.score)}/100`,
    advantage: best.allSameRate ? 'Optimizes fresh funds and EMI (same rate for all)' : 'Optimizes fresh funds, EMI, and interest rate',
    why: whyText,
    score: best.score,
    scoreBreakdown: best.breakdown,
    badgeColor: '#ffc107',
    allSameRate: best.allSameRate
  };
};

/**
 * Calculate savings comparison across all banks
 * Note: Does NOT include processing fee comparisons per user request
 */
const calculateSavingsComparison = (eligibleBanks) => {
  const comparisons = eligibleBanks.map(bank => {
    const emi = bank.newSingleEMI || bank.newBTLoanEMI;
    const tenure = bank.tenure || 5;

    // Calculate total payment
    const totalPayment = emi * tenure * 12;

    // Calculate total interest
    const principal = bank.maxLoanAmount;
    const totalInterest = totalPayment - principal;

    // Calculate interest percentage
    const interestPercentage = (totalInterest / principal) * 100;

    return {
      bankName: bank.bankName,
      freshFunds: bank.freshAmountDisbursed,
      emi: emi,
      interestRate: bank.interestRate,
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      interestPercentage: Math.round(interestPercentage),
      tenure: tenure
      // Note: Processing fee NOT included per user request
    };
  });

  // Sort by total interest (lowest first)
  const sortedByInterest = [...comparisons].sort((a, b) => a.totalInterest - b.totalInterest);

  return {
    allBanks: comparisons,
    lowestInterestCost: sortedByInterest[0],
    highestInterestCost: sortedByInterest[sortedByInterest.length - 1],
    interestDifference: sortedByInterest[sortedByInterest.length - 1].totalInterest - sortedByInterest[0].totalInterest
  };
};

/**
 * Generate comprehensive bank rankings
 * Note: Only ranks by fresh funds and EMI (no processing fees or other factors)
 */
const generateBankRankings = (eligibleBanks) => {
  // Rank by fresh funds
  const byFreshFunds = [...eligibleBanks].sort((a, b) =>
    b.freshAmountDisbursed - a.freshAmountDisbursed
  );

  // Rank by EMI
  const byEMI = [...eligibleBanks].sort((a, b) => {
    const emiA = a.newSingleEMI || a.newBTLoanEMI;
    const emiB = b.newSingleEMI || b.newBTLoanEMI;
    return emiA - emiB;
  });

  return {
    byFreshFunds: byFreshFunds.map((bank, index) => ({
      rank: index + 1,
      bankName: bank.bankName,
      value: `₹${bank.freshAmountDisbursed.toLocaleString()}`,
      medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
    })),

    byEMI: byEMI.map((bank, index) => ({
      rank: index + 1,
      bankName: bank.bankName,
      value: `₹${(bank.newSingleEMI || bank.newBTLoanEMI).toLocaleString()}`,
      medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
    }))

    // Note: Interest rate ranking removed as all banks use 11%
    // Note: Processing fee ranking NOT included per user request
  };
};

/**
 * Compare two specific scenarios (e.g., Scenario 1 vs Scenario 2)
 * @param {Array} scenario1Results - Results from first scenario
 * @param {Array} scenario2Results - Results from second scenario
 * @returns {Object} Detailed comparison
 */
export const compareScenarios = (scenario1Results, scenario2Results) => {
  const scenario1Analysis = compareBTResults(scenario1Results);
  const scenario2Analysis = compareBTResults(scenario2Results);

  if (!scenario1Analysis.hasEligibleBanks && !scenario2Analysis.hasEligibleBanks) {
    return {
      hasComparison: false,
      message: 'No eligible banks in either scenario'
    };
  }

  const scenario1Best = scenario1Analysis.recommendations?.bestForFreshFunds?.bank;
  const scenario2Best = scenario2Analysis.recommendations?.bestForFreshFunds?.bank;

  return {
    hasComparison: true,

    scenario1: {
      name: 'Scenario 1 (Include Credit Cards)',
      eligibleBanks: scenario1Analysis.eligibleCount,
      bestBank: scenario1Best?.bankName,
      freshFunds: scenario1Best?.freshAmountDisbursed,
      emi: scenario1Best?.newSingleEMI,
      totalOutflow: scenario1Best?.newSingleEMI,
      analysis: scenario1Analysis
    },

    scenario2: {
      name: 'Scenario 2 (Credit Card Obligation)',
      eligibleBanks: scenario2Analysis.eligibleCount,
      bestBank: scenario2Best?.bankName,
      freshFunds: scenario2Best?.freshAmountDisbursed,
      emi: scenario2Best?.newBTLoanEMI,
      totalOutflow: scenario2Best?.totalMonthlyOutflow,
      analysis: scenario2Analysis
    },

    comparison: {
      freshFundsDifference: scenario1Best && scenario2Best ?
        scenario1Best.freshAmountDisbursed - scenario2Best.freshAmountDisbursed : 0,
      outflowDifference: scenario1Best && scenario2Best ?
        (scenario2Best.totalMonthlyOutflow || scenario2Best.newBTLoanEMI) - scenario1Best.newSingleEMI : 0,
      recommendation: determineScenarioRecommendation(scenario1Best, scenario2Best)
    }
  };
};

/**
 * Determine which scenario to recommend
 */
const determineScenarioRecommendation = (scenario1Best, scenario2Best) => {
  if (!scenario1Best && scenario2Best) return 'Scenario 2';
  if (scenario1Best && !scenario2Best) return 'Scenario 1';
  if (!scenario1Best && !scenario2Best) return 'Neither';

  const freshDiff = scenario1Best.freshAmountDisbursed - scenario2Best.freshAmountDisbursed;
  const outflow1 = scenario1Best.newSingleEMI;
  const outflow2 = scenario2Best.totalMonthlyOutflow || scenario2Best.newBTLoanEMI;

  // If Scenario 1 gives significantly more funds (>3 lakhs) AND lower outflow
  if (freshDiff > 300000 && outflow1 <= outflow2) {
    return {
      scenario: 'Scenario 1',
      reason: `Scenario 1 provides ₹${Math.round(freshDiff / 100000)}L more fresh funds AND has lower/equal monthly outflow. Clear winner for maximum financial benefit.`
    };
  }

  // If Scenario 1 gives more funds with only slightly higher outflow
  if (freshDiff > 200000 && (outflow2 - outflow1) < 10000) {
    return {
      scenario: 'Scenario 1',
      reason: `Scenario 1 provides ₹${Math.round(freshDiff / 100000)}L more fresh funds with only ₹${outflow2 - outflow1} higher monthly outflow. Worth the trade-off.`
    };
  }

  // If both are similar
  if (Math.abs(freshDiff) < 100000) {
    return {
      scenario: 'Either',
      reason: 'Both scenarios offer similar benefits. Choose Scenario 1 for simplicity (single payment) or Scenario 2 to keep credit cards active.'
    };
  }

  return {
    scenario: 'Scenario 1',
    reason: 'Scenario 1 generally recommended for complete debt consolidation and maximum fresh funds.'
  };
};

/**
 * Generate customer-friendly comparison message
 */
export const generateComparisonMessage = (comparison) => {
  if (!comparison.hasEligibleBanks) {
    return {
      type: 'error',
      title: 'No Eligible Banks',
      message: comparison.message,
      suggestions: [
        'Consider improving your credit score',
        'Increase monthly income or reduce existing EMIs',
        'Try reducing desired loan amount',
        'Check if you have Fintech loans (some banks don\'t accept them)'
      ]
    };
  }

  const { recommendations, eligibleCount, totalBanks } = comparison;

  return {
    type: 'success',
    title: `${eligibleCount} of ${totalBanks} Banks Eligible`,
    topRecommendation: recommendations.bestOverall,
    alternativeOptions: [
      recommendations.bestForFreshFunds,
      recommendations.bestForLowEMI,
      recommendations.bestForLowInterest
    ].filter(rec => rec.bank.bankName !== recommendations.bestOverall.bank.bankName),
    summary: `We found ${eligibleCount} banks offering Balance Transfer. ${recommendations.bestOverall.bank.bankName} is your best overall choice, but review alternatives based on your priorities.`
  };
};
