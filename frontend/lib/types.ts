export interface SectorScore {
  name: string
  score: number
  sentiment: 'positive' | 'negative' | 'neutral'
  data_grounded?: boolean
}

export interface RiskDimensions {
  severity: number
  plausibility: number
  magnitude: number
  vulnerable_population: number
}

export interface StateImpact {
  state: string
  impact_score: number
}

export interface Stakeholder {
  group: string
  impact: string
  severity: 'high' | 'medium' | 'low'
}

export interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  sector: string
}

export interface TimelinePoint {
  period: string
  impact_score: number
  description: string
}

export interface FanPoint {
  t_years: number
  label: string
  mean: number
  p5: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  p95: number
}

export interface MonteCarloResult {
  n_trials: number
  seed: number
  risk_score: {
    mean: number
    std: number
    p5: number
    p10: number
    p50: number
    p90: number
    p95: number
    histogram: { bin_start: number; bin_end: number; share: number }[]
  }
  probabilities: {
    high_risk_now: number
    medium_or_worse_now: number
    high_impact_at_3y: number
    medium_or_worse_at_3y: number
    high_impact_at_5y: number
    medium_or_worse_at_5y: number
  }
  worst_case_95: { now: number; at_3y: number; at_5y: number }
  fan: FanPoint[]
  sensitivity: { input: string; correlation: number }[]
  assumptions: {
    method: string
    risk_dimension_sigma: number
    risk_dimension_correlation: number
    adaptability_sigma: number
    model_structure_rel_sigma: number
  }
}

export interface SimulationResult {
  id: string
  policy_title: string
  overall_risk_score: number
  risk_level?: 'High' | 'Medium' | 'Low'
  risk_dimensions?: RiskDimensions
  score_explanation?: string
  sectors: SectorScore[]
  states: StateImpact[]
  stakeholders: Stakeholder[]
  recommendations: Recommendation[]
  timeline: TimelinePoint[]
  monte_carlo?: MonteCarloResult
}

export interface SectorComparison {
  policy1_score: number
  policy2_score: number
  policy1_summary: string
  policy2_summary: string
  winner: 'policy1' | 'policy2'
}

export interface CompareResult {
  policy1_title: string
  policy2_title: string
  common_fields: string[]
  comparison: Record<string, SectorComparison>
  overall_winner: string
  overall_winner_reason: string
}