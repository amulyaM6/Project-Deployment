import { SimulationResult } from './types'

export const mockData: SimulationResult = {
  id: 'sim_pm_kisan_001',
  policy_title: 'PM Kisan Samman Nidhi Policy 2026',
  overall_risk_score: 68,
  risk_level: 'Medium',
  risk_dimensions: {
    severity: 70,
    plausibility: 55,
    magnitude: 80,
    vulnerable_population: 75,
  },
  score_explanation: 'Overall risk is classified as Medium (68/100). The biggest contributor is the severity of potential negative side-effects (rated 70/100). Score = severity×0.35 + plausibility×0.3 + magnitude×0.2 + vulnerable_population×0.15.',
  two_stage_scenario: {
    stage1_before: 'Before implementation, smallholder farmer families faced recurring liquidity crises during sowing seasons, depending heavily on informal high-interest moneylenders and risking crop failure due to input cost inflation.',
    stage2_after: 'After implementation, direct transfer of ₹6000 in 3 annual instalments stabilizes household liquidity and boosts crop investment; however, administrative verification bottlenecks and Aadhaar linkage delays create exclusion risks in remote regions.'
  },
  shap_importance: {
    'Regulatory Clause Scope': 0.35,
    'Target Population Density': 0.28,
    'Fiscal Outlay & Budget': 0.18,
    'Environmental Risk Factor': 0.11,
    'Digital Access Index': 0.08
  },
  xgboost_prediction: 68,
  sectors: [
    { name: 'Agriculture', score: 88, sentiment: 'positive', data_grounded: true },
    { name: 'Economy', score: 65, sentiment: 'neutral', data_grounded: true },
    { name: 'Healthcare', score: 30, sentiment: 'neutral', data_grounded: true },
    { name: 'Education', score: 45, sentiment: 'neutral', data_grounded: true },
    { name: 'Infrastructure', score: 60, sentiment: 'negative', data_grounded: true },
  ],
  states: [
    { state: 'Uttar Pradesh', impact_score: 86 },
    { state: 'Punjab', impact_score: 94 },
    { state: 'Maharashtra', impact_score: 78 },
    { state: 'Gujarat', impact_score: 82 },
    { state: 'Bihar', impact_score: 88 },
    { state: 'Assam', impact_score: 72 },
    { state: 'Karnataka', impact_score: 76 },
    { state: 'Kerala', impact_score: 42 },
    { state: 'Tamil Nadu', impact_score: 65 },
    { state: 'Rajasthan', impact_score: 80 }
  ],
  stakeholders: [
    { group: 'Farmers', impact: 'Direct cash transfers improve household income and crop investment but exclusion errors and payment delays can cause hardship.', severity: 'high' },
    { group: 'Urban Workers', impact: 'Benefit to farmers can raise rural demand for goods, indirectly supporting urban wages; however, fiscal pressure may affect macro stability.', severity: 'medium' },
    { group: 'State Governments', impact: 'Responsible for beneficiary verification, fund disbursement, and grievance handling; errors increase administrative burden and political risk.', severity: 'high' },
    { group: 'Exporters', impact: 'Limited direct effect; stable agricultural output supports raw material supply for export-oriented agri-industries.', severity: 'low' },
  ],
  recommendations: [
    { title: 'Enhance Beneficiary Verification', description: 'Introduce biometric cross-checks and third-party audits to reduce duplicate or bogus entries, ensuring payments reach genuine farmers and minimizing fiscal leakage.', priority: 'high', sector: 'Agriculture' },
    { title: 'Alternative Eligibility for North-East States', description: 'Develop community-based land-record validation mechanisms approved by DoNER to address the lack of individual land titles, improving inclusion in Assam, Arunachal Pradesh and other NE states.', priority: 'medium', sector: 'Agriculture' },
    { title: 'Aadhaar-Free Verification Option', description: 'Allow a fallback identification process (e.g., voter ID or bank-account linking) for beneficiaries without Aadhaar, preventing exclusion and speeding up enrolment.', priority: 'high', sector: 'Infrastructure' },
    { title: 'Robust Grievance Redressal Portal', description: 'Deploy a real-time, state-linked grievance portal with SLA-based resolution and transparent tracking, enhancing trust and enabling quick corrective action.', priority: 'low', sector: 'Infrastructure' },
  ],
  timeline: [
    { period: '6 months', impact_score: 65, description: 'Initial enrolment drive and bank account linking across state registries.' },
    { period: '1 year', impact_score: 63, description: 'First two installment disbursements completed; liquidity boost observed in rural markets.' },
    { period: '2 years', impact_score: 60, description: 'Resolution of administrative verification backlog; stable farm input investments.' },
    { period: '3 years', impact_score: 57, description: 'Sustained reduction in informal borrowing among smallholder farmer cohorts.' },
    { period: '5 years', impact_score: 54, description: 'Long-term baseline stabilization of rural household income resilience.' },
  ]
}