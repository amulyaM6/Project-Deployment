'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockData } from '@/lib/mockdata'
import RiskScore from '@/components/RiskScore'
import SectorChart from '@/components/SectorChart'
import StakeholderCard from '@/components/StakeholderCard'
import { SimulationResult } from '@/lib/types'
import Link from 'next/link'
import Recommendations from '@/components/Recommendations'
import ExportButton from '@/components/ExportButton'
import TimelineChart from '@/components/TimelineChart'
import IndiaMap from '@/components/IndiaMap'
import RiskBreakdown from '@/components/RiskBreakdown'
import MonteCarloFanChart from '@/components/MonteCarloFanChart'
import { runMonteCarlo } from '@/lib/api'
import {
  PlusCircle,
  LayoutGrid,
  BarChart2,
  MapPin,
  TrendingUp,
  Lightbulb,
  FileCheck2,
  AlertCircle,
  Search,
} from 'lucide-react'

type TabId = 'overview' | 'sectors' | 'regional' | 'timeline' | 'recommendations'

export default function Dashboard() {
  const [data, setData] = useState<SimulationResult>(mockData)
  const [isReal, setIsReal] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [mcError, setMcError] = useState(false)

   /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = localStorage.getItem('simulationResult')
    if (stored) {
      try {
        setData(JSON.parse(stored))
        setIsReal(true)
      } catch (err) {
        console.error('Failed to parse simulationResult from localStorage:', err)
      }
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Older stored results (and the demo data) have no Monte Carlo block, so
  // request one from the backend. On failure a notice is shown instead.
  useEffect(() => {
    if (data.monte_carlo || !data.risk_dimensions) return
    let cancelled = false
    runMonteCarlo(data.risk_dimensions, data.stakeholders)
      .then((mc) => {
        if (!cancelled) setData((d) => ({ ...d, monte_carlo: mc }))
      })
      .catch(() => {
        if (!cancelled) setMcError(true)
      })
    return () => {
      cancelled = true
    }
  }, [data.monte_carlo, data.risk_dimensions, data.stakeholders])

  const rerunMonteCarlo = async (nTrials: number) => {
    if (!data.risk_dimensions) return
    const mc = await runMonteCarlo(data.risk_dimensions, data.stakeholders, nTrials)
    setData((d) => ({ ...d, monte_carlo: mc }))
  }

  const filteredStates = data.states.filter((s) =>
    s.state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'sectors', label: 'Sector Analysis', icon: BarChart2 },
    { id: 'regional', label: 'Regional Heatmap', icon: MapPin },
    { id: 'timeline', label: 'Impact Forecast', icon: TrendingUp },
    { id: 'recommendations', label: 'AI Mitigation', icon: Lightbulb },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 sm:px-6 lg:px-12 py-8 bg-grid-cyber relative overflow-hidden">
      {/* Background Aurora Ambient Effects */}
      <div className="absolute top-0 right-1/4 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[600px] left-10 w-[600px] h-[500px] bg-purple-500/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">

        {/* ── Executive Header Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 rounded-3xl shadow-xl shadow-slate-900/5"
        >
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              {!isReal ? (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Showing Benchmark Demo Baseline — Upload policy for live AI engine run
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                  Live AI Engine Analysis Complete
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {data.policy_title}
            </h1>
            <p className="text-slate-400 font-mono text-xs flex items-center gap-2">
              <span>Simulation Hash: <strong className="text-slate-600">{data.id}</strong></span>
              <span>•</span>
              <span>
                Iterations:{' '}
                <strong className="text-indigo-600">
                  {data.monte_carlo
                    ? `${data.monte_carlo.n_trials.toLocaleString()} Monte Carlo runs`
                    : 'Monte Carlo pending'}
                </strong>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <ExportButton data={data} />
            <Link href="/upload">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Policy Run</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* ── Executive Dashboard Navigation Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
                  isActive
                    ? 'text-indigo-600 bg-white shadow-md shadow-slate-900/5 border border-slate-200/90'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="dashboardTab"
                    className="absolute inset-0 bg-white rounded-2xl border border-indigo-200 shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Dynamic Tab View Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              {/* Top Row: Risk Score Radial Gauge + Sector Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RiskScore score={data.overall_risk_score} />
                <div className="lg:col-span-2">
                  <SectorChart sectors={data.sectors} />
                </div>
              </div>

              {/* Risk Dimensions Breakdown */}
              <RiskBreakdown dimensions={data.risk_dimensions} explanation={data.score_explanation} />

              {/* Timeline Forecast Summary */}
              {data.timeline && data.timeline.length > 0 && (
                <TimelineChart timeline={data.timeline} />
              )}

              {/* Stakeholders Impact Overview */}
              <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5 rounded-3xl p-7">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Demographic & Stakeholder Matrix</h2>
                    <p className="text-slate-400 text-xs font-medium">Population group sensitivity metrics</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    {data.stakeholders.length} Key Groups Tracked
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.stakeholders.map((s, i) => (
                    <StakeholderCard key={i} stakeholder={s} />
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {data.recommendations && data.recommendations.length > 0 && (
                <Recommendations recommendations={data.recommendations} />
              )}
            </motion.div>
          )}

          {activeTab === 'sectors' && (
            <motion.div
              key="sectors"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <SectorChart sectors={data.sectors} />
              <RiskBreakdown dimensions={data.risk_dimensions} explanation={data.score_explanation} />
            </motion.div>
          )}

          {activeTab === 'regional' && (
            <motion.div
              key="regional"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              {/* Interactive India Regional Heatmap */}
              <IndiaMap states={data.states} />

              {/* Filterable State Impact Grid */}
              <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5 rounded-3xl p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">State-wise Impact Index</h2>
                    <p className="text-slate-400 text-xs font-medium">Regional granularity score card</p>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter by state..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 w-full sm:w-60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredStates.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-slate-50/80 border border-slate-200/70 rounded-2xl px-5 py-3.5 hover:bg-white hover:shadow-xs transition"
                    >
                      <span className="text-slate-900 font-extrabold text-xs">{s.state}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-28 bg-slate-200/80 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.impact_score > 70 ? 'bg-rose-500' : s.impact_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${s.impact_score}%` }}
                          />
                        </div>
                        <span className={`text-xs font-extrabold w-8 text-right ${
                          s.impact_score > 70 ? 'text-rose-600' : s.impact_score > 40 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {s.impact_score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {data.timeline && <TimelineChart timeline={data.timeline} />}
              {data.monte_carlo ? (
                <MonteCarloFanChart data={data.monte_carlo} onRerun={rerunMonteCarlo} />
              ) : (
                <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 text-sm text-slate-500">
                  {mcError
                    ? 'Monte Carlo analysis unavailable: could not reach the backend /simulate endpoint.'
                    : data.risk_dimensions
                      ? 'Running Monte Carlo simulation…'
                      : 'Upload a policy to run the Monte Carlo analysis.'}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {data.recommendations && <Recommendations recommendations={data.recommendations} />}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}