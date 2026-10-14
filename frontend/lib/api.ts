import axios from 'axios'
import { MonteCarloResult, RiskDimensions, Stakeholder } from './types'

export const runMonteCarlo = async (
  riskDimensions: RiskDimensions,
  stakeholders: Stakeholder[],
  nTrials = 10000
): Promise<MonteCarloResult> => {
  const res = await axios.post(`${BASE}/simulate`, {
    risk_dimensions: riskDimensions,
    stakeholders,
    n_trials: nTrials
  })
  return res.data
}

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const uploadPolicy = async (file: File) => {
  const form = new FormData()
  form.append('file', file)
  const res = await axios.post(`${BASE}/upload`, form)
  return res.data
}

export const comparePolicies = async (id1: string, id2: string) => {
  const res = await axios.post(`${BASE}/compare`, {
    policy_id_1: id1,
    policy_id_2: id2
  })
  return res.data
}
