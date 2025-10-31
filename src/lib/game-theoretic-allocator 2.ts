/**
 * Game-Theoretic Intervention Allocator
 *
 * Uses a simplified Nash equilibrium approach to optimize intervention allocation.
 * The allocator maximizes R0 reduction while considering cost-effectiveness.
 */

export interface Intervention {
  name: string;
  r0Reduction: number;  // Percentage reduction in R0 (0-1)
  cost: number;         // Relative cost (1-10 scale)
  applicability: {      // Which diseases this intervention applies to
    dengue: boolean;
    malaria: boolean;
    diarrhoea: boolean;
  };
}

export interface AllocationResult {
  interventions: {
    name: string;
    allocation: number;  // Percentage of budget allocated (0-1)
    effectiveR0Reduction: number;
  }[];
  totalR0Reduction: number;
  effectiveR0: number;
  optimalMix: string[];  // Names of interventions in the optimal mix
}

// Define intervention characteristics
export const INTERVENTIONS: { [key: string]: Intervention } = {
  'mosquito-control': {
    name: 'mosquito-control',
    r0Reduction: 0.35,  // 35% reduction
    cost: 6,
    applicability: {
      dengue: true,
      malaria: true,
      diarrhoea: false,
    },
  },
  'vaccination': {
    name: 'vaccination',
    r0Reduction: 0.45,  // 45% reduction
    cost: 8,
    applicability: {
      dengue: true,
      malaria: false,  // No widely available malaria vaccine
      diarrhoea: false,
    },
  },
  'water-sanitation': {
    name: 'water-sanitation',
    r0Reduction: 0.40,  // 40% reduction
    cost: 7,
    applicability: {
      dengue: false,
      malaria: false,
      diarrhoea: true,
    },
  },
  'surge-labs': {
    name: 'surge-labs',
    r0Reduction: 0.25,  // 25% reduction via early detection
    cost: 5,
    applicability: {
      dengue: true,
      malaria: true,
      diarrhoea: true,
    },
  },
  'community-bcc': {
    name: 'community-bcc',
    r0Reduction: 0.30,  // 30% reduction via behavior change
    cost: 3,
    applicability: {
      dengue: true,
      malaria: true,
      diarrhoea: true,
    },
  },
};

/**
 * Calculate the cost-effectiveness score for an intervention
 */
function calculateCostEffectiveness(intervention: Intervention): number {
  return intervention.r0Reduction / intervention.cost;
}

/**
 * Calculate diminishing returns for multiple interventions
 * Using a submodular function to model diminishing marginal returns
 */
function calculateDiminishingReturns(
  r0Reductions: number[],
  allocations: number[]
): number {
  let totalReduction = 0;

  // Sort by R0 reduction (descending) to apply diminishing returns correctly
  const combined = r0Reductions.map((r, i) => ({ r, a: allocations[i] }));
  combined.sort((a, b) => b.r - a.r);

  // Apply submodular diminishing returns
  for (let i = 0; i < combined.length; i++) {
    const diminishingFactor = Math.pow(0.85, i); // Each additional intervention is 85% as effective
    totalReduction += combined[i].r * combined[i].a * diminishingFactor;
  }

  // Cap at 80% max reduction (can't eliminate disease completely)
  return Math.min(totalReduction, 0.80);
}

/**
 * Game-theoretic allocation using a greedy best-response approach
 * Simulates players (interventions) competing for budget allocation
 */
export function allocateInterventions(
  disease: string,
  baseR0: number,
  budget: number = 1.0,  // Normalized budget (0-1)
  selectedInterventions?: string[]
): AllocationResult {
  // Filter interventions applicable to this disease
  const applicableInterventions = Object.values(INTERVENTIONS).filter(
    (int) => int.applicability[disease.toLowerCase() as keyof typeof int.applicability]
  );

  // If specific interventions are selected, use only those
  let activeInterventions = applicableInterventions;
  if (selectedInterventions && selectedInterventions.length > 0) {
    activeInterventions = applicableInterventions.filter((int) =>
      selectedInterventions.includes(int.name)
    );
  }

  // If no applicable interventions, return no allocation
  if (activeInterventions.length === 0) {
    return {
      interventions: [],
      totalR0Reduction: 0,
      effectiveR0: baseR0,
      optimalMix: [],
    };
  }

  // Calculate cost-effectiveness for each intervention
  const costEffectiveness = activeInterventions.map((int) => ({
    intervention: int,
    score: calculateCostEffectiveness(int),
  }));

  // Sort by cost-effectiveness (descending)
  costEffectiveness.sort((a, b) => b.score - a.score);

  // Greedy allocation: allocate budget to most cost-effective interventions
  const allocations: { [key: string]: number } = {};
  let remainingBudget = budget;

  for (const { intervention } of costEffectiveness) {
    // Calculate how much budget this intervention should get
    const normalizedCost = intervention.cost / 10; // Normalize to 0-1
    const allocation = Math.min(normalizedCost, remainingBudget);

    allocations[intervention.name] = allocation;
    remainingBudget -= allocation;

    if (remainingBudget <= 0) break;
  }

  // Calculate effective R0 reduction with diminishing returns
  const r0Reductions = activeInterventions.map((int) => int.r0Reduction);
  const allocationValues = activeInterventions.map((int) => allocations[int.name] || 0);

  const totalR0Reduction = calculateDiminishingReturns(r0Reductions, allocationValues);
  const effectiveR0 = baseR0 * (1 - totalR0Reduction);

  // Build result
  const interventionResults = activeInterventions.map((int) => ({
    name: int.name,
    allocation: allocations[int.name] || 0,
    effectiveR0Reduction: int.r0Reduction * (allocations[int.name] || 0),
  }));

  // Get optimal mix (interventions with allocation > 0)
  const optimalMix = interventionResults
    .filter((int) => int.allocation > 0)
    .map((int) => int.name);

  return {
    interventions: interventionResults,
    totalR0Reduction,
    effectiveR0,
    optimalMix,
  };
}

/**
 * Calculate post-intervention expected cases
 */
export function calculateExpectedCases(
  initialCases: number,
  effectiveR0: number,
  week: number
): number {
  // SEIR-like model approximation
  // Cases grow exponentially with effective R0
  const growthFactor = Math.pow(effectiveR0, week);
  const expectedCases = initialCases * growthFactor;

  // Apply saturation (population limits)
  const populationLimit = 1000000; // Approximate district population
  const saturated = populationLimit * (1 - Math.exp(-expectedCases / populationLimit));

  return Math.round(saturated);
}

/**
 * Calculate risk level based on effective R0 and case count
 */
export function calculateRiskLevel(
  effectiveR0: number,
  expectedCases: number
): { level: string; score: number; color: string } {
  // Risk score combines R0 and case count
  const r0Component = Math.min(effectiveR0 / 3.0, 1.0); // Normalize R0 (max 3.0 = high risk)
  const casesComponent = Math.min(expectedCases / 10000, 1.0); // Normalize cases

  const riskScore = (r0Component * 0.6 + casesComponent * 0.4); // Weighted combination

  if (riskScore < 0.3) {
    return { level: 'Low', score: riskScore, color: '#10b981' }; // Green
  } else if (riskScore < 0.6) {
    return { level: 'Medium', score: riskScore, color: '#f59e0b' }; // Orange
  } else {
    return { level: 'High', score: riskScore, color: '#ef4444' }; // Red
  }
}
