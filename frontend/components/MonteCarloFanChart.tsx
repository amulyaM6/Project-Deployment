'use client'

import { useState } from 'react'
import {
  ComposedChart, Area, Line, BarChart, Bar, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { Dices, Loader2 } from 'lucide-react'
import { FanPoint, MonteCarloResult } from '@/lib/types'

const pct = (x: number) => `${(x * 100).toFixed(x > 0 && x < 0.001 ? 2 : 1)}%`
const zoneColor = (v: number) => (v >= 70 ? '#f43f5e' : v >= 40 ? '#f59e0b' : '#10b981')

const DRIVER_LABELS: Record<string, string> = {
  'risk_dim:severity': 'Severity rating',
  'risk_dim:plausibility': 'Plausibility rating',
  'risk_dim:magnitude': 'Magnitude rating',
  'risk_dim:vulnerable_population': 'Vulnerable-population rating',
  stakeholder_adaptability: 'Stakeholder adaptability',
  'model:equilibrium_factor': 'Model: recovery ceiling',
  'model:decay_rate': 'Model: speed of recovery',
}

interface FanTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
}

function FanTooltip({ active, payload }: FanTooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as FanPoint
  return (
    <div className="bg-white/95 border border-slate-200 shadow-xl rounded-xl p-3 text-xs space-y-1">
      <div className="font-extrabold text-indigo-600 uppercase tracking-wider">{p.label}</div>
      <div className="text-slate-700 font-semibold">Median: {p.p50}</div>
      <div className="text-slate-500">50% of runs: {p.p25} – {p.p75}</div>
      <div className="text-slate-500">80% of runs: {p.p10} – {p.p90}</div>
      <div className="text-slate-400">Plausible worst (P95): {p.p95}</div>
    </div>
  )
}

interface Props {
  data: MonteCarloResult
  onRerun?: (nTrials: number) => Promise<void>
}

export default function MonteCarloFanChart({ data, onRerun }: Props) {
  const [loading, setLoading] = useState(false)
  const bigRun = data.n_trials >= 50000

  const rerun = async () => {
    if (!onRerun) return
    setLoading(true)
    try {
      await onRerun(bigRun ? 10000 : 50000)
    } finally {
      setLoading(false)
    }
  }

  // Stacked-area trick: an invisible base up to P10, then bands on top of it.
  const fanData = data.fan.map((f) => ({
    ...f,
    base: f.p10,
    band_lo: f.p25 - f.p10,
    band_mid: f.p75 - f.p25,
    band_hi: f.p90 - f.p75,
  }))

  const hist = data.risk_score.histogram.map((b) => ({
    label: `${b.bin_start}-${b.bin_end}`,
    mid: (b.bin_start + b.bin_end) / 2,
    share: b.share,
  }))

  const topDrivers = data.sensitivity.slice(0, 3)
  const maxAbs = Math.max(...data.sensitivity.map((d) => Math.abs(d.correlation)), 0.01)
  const a = data.assumptions
  const last = data.fan[data.fan.length - 1]

  const metrics = [
    { label: 'Chance of HIGH risk at launch', value: pct(data.probabilities.high_risk_now), sub: 'score ≥ 70' },
    { label: 'Chance still HIGH after 3 years', value: pct(data.probabilities.high_impact_at_3y), sub: 'impact ≥ 70' },
    { label: 'Plausible worst case (P95), 3 yrs', value: data.worst_case_95.at_3y.toFixed(0), sub: 'out of 100' },
    { label: 'Median impact after 5 years', value: last.p50.toFixed(0), sub: `80% range ${last.p10.toFixed(0)}–${last.p90.toFixed(0)}` },
  ]

  return (
    <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 shadow-lg shadow-slate-900/5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Monte Carlo Uncertainty Analysis</h2>
            <p className="text-slate-400 text-xs font-medium">
              {data.n_trials.toLocaleString()} simulated runs · seed {data.seed}
            </p>
          </div>
        </div>
        {onRerun && (
          <button
            onClick={rerun}
            disabled={loading}
            className="text-xs font-bold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {bigRun ? 'Re-run with 10,000 trials' : 'Re-run with 50,000 trials'}
          </button>
        )}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-tight">{m.label}</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{m.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Fan chart */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 mb-1">Impact trajectory fan</h3>
        <p className="text-xs text-slate-400 mb-3">
          Line = median run. Dark band = middle 50% of runs, light band = middle 80%.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={fanData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip content={FanTooltip} />
            <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'High (70)', fill: '#f43f5e', fontSize: 10, fontWeight: 700, position: 'insideTopRight' }} />
            <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Medium (40)', fill: '#f59e0b', fontSize: 10, fontWeight: 700, position: 'insideTopRight' }} />
            <Area dataKey="base" stackId="fan" stroke="none" fill="transparent" isAnimationActive={false} />
            <Area dataKey="band_lo" stackId="fan" stroke="none" fill="#6366f1" fillOpacity={0.15} isAnimationActive={false} />
            <Area dataKey="band_mid" stackId="fan" stroke="none" fill="#6366f1" fillOpacity={0.35} isAnimationActive={false} />
            <Area dataKey="band_hi" stackId="fan" stroke="none" fill="#6366f1" fillOpacity={0.15} isAnimationActive={false} />
            <Line dataKey="p50" stroke="#4338ca" strokeWidth={3} dot={{ r: 4, fill: '#4338ca', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution + drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 mb-1">Distribution of the risk score at launch</h3>
          <p className="text-xs text-slate-400 mb-3">
            Median {data.risk_score.p50} · 80% range {data.risk_score.p10}–{data.risk_score.p90} · std {data.risk_score.std}
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hist} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="mid" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [pct(Number(v)), 'of runs']}
                labelFormatter={(_, p) => `Score ${(p?.[0]?.payload as { label?: string } | undefined)?.label ?? ''}`}
              />
              <Bar dataKey="share" isAnimationActive={false}>
                {hist.map((h, i) => (
                  <Cell key={i} fill={zoneColor(h.mid)} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-800 mb-1">What drives the uncertainty?</h3>
          <p className="text-xs text-slate-400 mb-3">
            Correlation of each uncertain input with the 5-year outcome. Biggest driver:{' '}
            <span className="font-bold text-slate-600">{DRIVER_LABELS[topDrivers[0].input] ?? topDrivers[0].input}</span>.
          </p>
          <div className="space-y-2">
            {data.sensitivity.map((d) => (
              <div key={d.input} className="flex items-center gap-2 text-[11px]">
                <span className="w-44 text-slate-600 font-semibold truncate">{DRIVER_LABELS[d.input] ?? d.input}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.correlation >= 0 ? 'bg-rose-400' : 'bg-emerald-400'}`}
                    style={{ width: `${(Math.abs(d.correlation) / maxAbs) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right font-bold text-slate-500">{d.correlation > 0 ? '+' : ''}{d.correlation.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Red = raises impact, green = lowers it.</p>
        </div>
      </div>

      {/* Honest assumptions note */}
      <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
        <span className="font-bold text-slate-500">How to read this:</span> each run re-draws the four AI risk ratings
        (±{a.risk_dimension_sigma} pts, correlation {a.risk_dimension_correlation}), every stakeholder group&apos;s
        adaptability (±{a.adaptability_sigma}) and the recovery-model constants (±{Math.round(a.model_structure_rel_sigma * 100)}%),
        then runs the same scoring and decay model. The spread shows how sensitive the forecast is to these
        assumptions. The uncertainty levels are stated assumptions, not calibrated to historical outcomes, so the
        bands are scenario ranges, not statistical guarantees.
      </p>
    </div>
  )
}