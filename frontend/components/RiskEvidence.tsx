'use client'

import { ShieldCheck, AlertCircle } from 'lucide-react'
import { DimensionDetail, RiskDimensions } from '@/lib/types'

type Confidence = 'high' | 'medium' | 'low'

const LABELS: Record<keyof RiskDimensions, string> = {
  severity: 'Severity',
  plausibility: 'Plausibility',
  magnitude: 'Magnitude',
  vulnerable_population: 'Vulnerable groups',
}

const CONF_STYLE: Record<Confidence, string> = {
  high: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low: 'bg-rose-50 border-rose-200 text-rose-700',
}

function shortModel(model: string): string {
  return model.replace('openai/', '').replace('@T', ' / temp ')
}

function evidenceBadge(verified: boolean | null): { text: string; cls: string } {
  if (verified === true) {
    return { text: 'Quote found in policy text', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
  }
  if (verified === false) {
    return { text: 'Quote NOT found in policy text', cls: 'text-rose-700 bg-rose-50 border-rose-200' }
  }
  return { text: 'No direct evidence cited', cls: 'text-slate-600 bg-slate-100 border-slate-200' }
}

export default function RiskEvidence({
  details,
  contributions,
  confidence,
  models,
}: {
  details?: Record<keyof RiskDimensions, DimensionDetail>
  contributions?: Record<string, number>
  confidence?: Confidence
  models?: string[]
}) {
  if (!details) return null

  const keys = Object.keys(LABELS) as (keyof RiskDimensions)[]
  const total = contributions
    ? Object.values(contributions).reduce((a, b) => a + b, 0)
    : undefined
  const modelNames = Array.from(new Set((models ?? []).map((m) => m.split('@')[0].replace('openai/', ''))))
  const runs = models?.length ?? 0

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-lg shadow-slate-900/5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Why this score?</h2>
            <p className="text-slate-400 text-xs font-medium">
              Each factor is rated by {runs || 'several'} AI raters against a fixed rubric and must quote the policy.
              The overall score is a fixed weighted sum.
            </p>
          </div>
        </div>
        {confidence && (
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${CONF_STYLE[confidence]}`}>
            Rater agreement: {confidence}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {keys.map((k) => {
          const d = details[k]
          if (!d) return null
          const c = contributions?.[k]
          const w = c !== undefined && d.score > 0 ? Math.round((c / d.score) * 100) / 100 : undefined
          const scores = d.ratings.map((r) => r.score)
          const lo = Math.min(...scores)
          const hi = Math.max(...scores)
          return (
            <div key={k} className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-sm text-slate-900">{LABELS[k]}</span>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-extrabold text-slate-900">{d.score}/100</span>
                  {w !== undefined && c !== undefined && (
                    <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                      {d.score} × {w} = {c} pts
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full border font-bold ${CONF_STYLE[d.confidence]}`}>
                    {d.confidence} agreement
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Raters scored between {lo} and {hi}; {d.evidence_verified_count} of {d.ratings.length} quotes were found in the policy text.
              </p>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-bold text-indigo-700">
                  Show each rater reason and evidence
                </summary>
                <div className="mt-3 space-y-3">
                  {d.ratings.map((r, i) => {
                    const b = evidenceBadge(r.evidence_verified)
                    return (
                      <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-slate-500">{shortModel(r.model)}</span>
                          <span className="font-extrabold text-slate-900">{r.score}</span>
                        </div>
                        <p className="text-slate-700 leading-snug">{r.reason}</p>
                        {r.evidence && r.evidence !== 'NO_DIRECT_EVIDENCE' && (
                          <blockquote className="border-l-2 border-indigo-200 pl-3 text-slate-500 italic leading-snug">
                            “{r.evidence}”
                          </blockquote>
                        )}
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.cls}`}>
                          {b.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </details>
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex items-start gap-2 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs leading-relaxed text-slate-700">
        <AlertCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          {total !== undefined && (
            <span className="block font-bold text-indigo-900 mb-1">
              Sum of contributions = {total.toFixed(1)} (fixed weights applied to the median rating of each factor)
            </span>
          )}
          Agreement between raters shows stability, not correctness: all raters come from one model family
          {modelNames.length > 0 ? ` (${modelNames.join(', ')})` : ''}. A found quote shows the evidence is real,
          not that the rating is right. Scores are decision-support estimates, not validated forecasts.
        </div>
      </div>
    </div>
  )
}
