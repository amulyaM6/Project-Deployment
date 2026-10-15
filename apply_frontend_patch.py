#!/usr/bin/env python3
"""
apply_frontend_patch.py

Run from the repo root (the folder that contains `frontend/`):

    python apply_frontend_patch.py

What it does (safe to run twice; it skips anything already applied):
  1. Relabels claims the code does not back (ABM, multi-agent, "agent iterations").
  2. Raises the upload timeout from 60 s to 180 s.
  3. Relabels the risk-dimension panel (ratings come from raters, the formula is fixed).
  4. Adds a "Why this score?" panel (rater reasons, evidence quotes, confidence,
     exact contribution of each dimension) to the dashboard overview tab.
  5. Removes two UNUSED components that contain fake claims
     (LiveAgentGraph = fake agent log, PathHighlighting = SHAP).

Originals are copied to ./patch_backup/ as .bak files first.
"""
import os
import shutil
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
FE = os.path.join(ROOT, "frontend")
BK = os.path.join(ROOT, "patch_backup")

if not os.path.isdir(FE):
    sys.exit("Cannot find the 'frontend' folder. Run this from the repo root, "
             "or pass the repo path:  python apply_frontend_patch.py <repo-path>")
os.makedirs(BK, exist_ok=True)

results = []
_backed = set()


def _path(rel):
    return os.path.join(FE, *rel.split("/"))


def _read(p):
    with open(p, "rb") as f:
        return f.read().decode("utf-8")


def _write(p, s):
    with open(p, "wb") as f:
        f.write(s.encode("utf-8"))


def _backup(rel):
    if rel in _backed:
        return
    p = _path(rel)
    if os.path.exists(p):
        shutil.copy2(p, os.path.join(BK, rel.replace("/", "__") + ".bak"))
    _backed.add(rel)


def log(ok, msg):
    results.append(ok)
    print(("OK    " if ok else "FAIL  ") + msg)


def edit(rel, old, new, label):
    p = _path(rel)
    if not os.path.exists(p):
        return log(False, f"{label}: {rel} not found")
    s = _read(p)
    if old not in s and new in s:
        return log(True, f"{label}: already applied")
    n = s.count(old)
    if n == 0:
        return log(False, f"{label}: expected text not found in {rel}")
    if n > 1:
        return log(False, f"{label}: text appears {n} times in {rel}; skipped")
    _backup(rel)
    _write(p, s.replace(old, new))
    log(True, label)


def insert_near(rel, anchor, block, marker, label, before=False):
    """Insert `block` on its own lines before/after the line containing `anchor`."""
    p = _path(rel)
    if not os.path.exists(p):
        return log(False, f"{label}: {rel} not found")
    s = _read(p)
    if marker in s:
        return log(True, f"{label}: already applied")
    i = s.find(anchor)
    if i == -1:
        return log(False, f"{label}: anchor not found in {rel}")
    nl = "\r\n" if "\r\n" in s else "\n"
    block_nl = block.replace("\r\n", "\n").replace("\n", nl)
    if before:
        line_start = s.rfind("\n", 0, i) + 1
        pos = line_start
    else:
        eol = s.find("\n", i)
        pos = len(s) if eol == -1 else eol + 1
    _backup(rel)
    _write(p, s[:pos] + block_nl + nl + s[pos:])
    log(True, label)


def delete_line(rel, text, label):
    p = _path(rel)
    if not os.path.exists(p):
        return log(False, f"{label}: {rel} not found")
    s = _read(p)
    if text not in s:
        return log(True, f"{label}: already applied")
    lines = s.splitlines(keepends=True)
    kept = [ln for ln in lines if text not in ln]
    _backup(rel)
    _write(p, "".join(kept))
    log(True, label)


def still_used(name, skip_rel):
    """True if `name` is referenced anywhere in the frontend other than its own file."""
    for base in ("app", "components", "lib"):
        for dp, _, files in os.walk(os.path.join(FE, base)):
            for fn in files:
                if not fn.endswith((".ts", ".tsx")):
                    continue
                full = os.path.join(dp, fn)
                rel = os.path.relpath(full, FE).replace(os.sep, "/")
                if rel == skip_rel:
                    continue
                if name in _read(full):
                    return True
    return False


def remove_file(rel, name, label):
    p = _path(rel)
    if not os.path.exists(p):
        return log(True, f"{label}: already removed")
    if still_used(name, rel):
        return log(False, f"{label}: {name} is still referenced somewhere; NOT deleted")
    _backup(rel)
    os.remove(p)
    log(True, label)


# ---------------------------------------------------------------- 1. relabels
edit("components/Navbar.tsx", "v2.0 ABM+MC", "v2.0 \u00b7 Monte Carlo", "Navbar badge")

edit("app/upload/page.tsx",
     "to trigger 10,000 Monte Carlo agent iterations across 28 states.",
     "for an evidence-checked risk analysis with 10,000-trial Monte Carlo uncertainty across 28 states.",
     "Upload page subtitle")
edit("app/upload/page.tsx",
     "Running multi-agent simulation models across 28 states and 5 economic sectors",
     "Rating risk factors and running Monte Carlo uncertainty analysis across 28 states and 5 sectors",
     "Upload page loading text")
edit("app/upload/page.tsx", "}, 60000)", "}, 180000)", "Upload timeout 60s -> 180s")
edit("app/upload/page.tsx", "// Cancel everything after 60 seconds",
     "// Cancel everything after 3 minutes", "Upload timeout comment")

edit("app/page.tsx", "Autonomous Multi-Agent Legal Simulation Engine",
     "AI Policy Impact Analysis Engine", "Landing badge")
edit("app/page.tsx",
     "Our AI pipeline instantiates economic agents, parses regulatory clauses into vector embeddings, "
     "and executes 10,000 Monte Carlo iterations across 28 Indian states.",
     "Our AI pipeline retrieves the relevant clauses, rates risk against a fixed rubric with evidence "
     "quoted from the policy, and runs 10,000 Monte Carlo trials to show the uncertainty across 28 Indian states.",
     "Landing description")
edit("components/QuantumParticleCanvas.tsx", "'ABM',", "'MC',", "Background symbol ABM -> MC")

# ------------------------------------------- 2. risk panel wording (honest labels)
edit("components/RiskBreakdown.tsx", "Deterministic Risk Dimensions",
     "Risk Dimensions (rubric-rated)", "Risk panel title")
edit("components/RiskBreakdown.tsx", "Algorithmic risk factor decomposition",
     "Median of three rater scores, combined by a fixed formula", "Risk panel subtitle")
edit("components/RiskBreakdown.tsx", "Likelihood based on historical economic data",
     "Likelihood of the side-effects occurring", "Plausibility description")

# ------------------------------------------------------------------- 3. types
TYPES_BLOCK = """export interface RaterRating {
  model: string
  score: number
  reason: string
  evidence: string
  evidence_verified: boolean | null
}

export interface DimensionDetail {
  score: number
  spread: number
  evidence_verified_count: number
  confidence: 'high' | 'medium' | 'low'
  ratings: RaterRating[]
}

export interface TwoStageScenario {
  stage1_before: string
  stage2_after: string
}
"""
insert_near("lib/types.ts", "export interface SimulationResult {", TYPES_BLOCK,
            "export interface DimensionDetail", "types: rater/detail interfaces", before=True)
insert_near("lib/types.ts", "  monte_carlo?: MonteCarloResult",
            "  two_stage_scenario?: TwoStageScenario\n"
            "  risk_dimension_details?: Record<keyof RiskDimensions, DimensionDetail>\n"
            "  risk_confidence?: 'high' | 'medium' | 'low'\n"
            "  risk_models_used?: string[]\n"
            "  risk_contributions?: Record<string, number>",
            "risk_dimension_details?:", "types: new result fields")

# ------------------------------------------------- 4. Why-this-score component
COMPONENT = r"""'use client'

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
"""

comp_rel = "components/RiskEvidence.tsx"
comp_path = _path(comp_rel)
if os.path.exists(comp_path) and _read(comp_path) == COMPONENT:
    log(True, "RiskEvidence component: already applied")
else:
    if os.path.exists(comp_path):
        _backup(comp_rel)
    _write(comp_path, COMPONENT)
    log(True, "RiskEvidence component written")

insert_near("app/dashboard/page.tsx", "import RiskBreakdown from '@/components/RiskBreakdown'",
            "import RiskEvidence from '@/components/RiskEvidence'",
            "import RiskEvidence", "Dashboard import")
insert_near("app/dashboard/page.tsx",
            "<RiskBreakdown dimensions={data.risk_dimensions} explanation={data.score_explanation} />",
            "              {/* Why this score? rater evidence, confidence, exact contributions */}\n"
            "              <RiskEvidence\n"
            "                details={data.risk_dimension_details}\n"
            "                contributions={data.risk_contributions}\n"
            "                confidence={data.risk_confidence}\n"
            "                models={data.risk_models_used}\n"
            "              />",
            "<RiskEvidence", "Dashboard: Why-this-score panel")

insert_near("app/dashboard/page.tsx", "import RiskBreakdown from '@/components/RiskBreakdown'",
            "import TwoStageScenarioCard from '@/components/TwoStageScenarioCard'",
            "import TwoStageScenarioCard", "Dashboard import: two-stage scenario card")
insert_near("app/dashboard/page.tsx", "{/* Risk Dimensions Breakdown */}",
            "              {/* Two-stage scenario (before / after) with read-aloud */}\n"
            "              <TwoStageScenarioCard scenario={data.two_stage_scenario} />\n",
            "<TwoStageScenarioCard", "Dashboard: two-stage scenario card", before=True)

def remove_block(rel, start_text, end_text, label):
    """Delete from the line containing start_text through the next line containing end_text."""
    p = _path(rel)
    if not os.path.exists(p):
        return log(False, f"{label}: {rel} not found")
    s = _read(p)
    if start_text not in s:
        return log(True, f"{label}: already applied")
    lines = s.splitlines(keepends=True)
    out, skipping, done = [], False, False
    for ln in lines:
        if not done and not skipping and start_text in ln:
            skipping = True
        if skipping:
            if end_text in ln:
                skipping, done = False, True
            continue
        out.append(ln)
    if skipping:
        return log(False, f"{label}: end marker not found; nothing changed")
    _backup(rel)
    _write(p, "".join(out))
    log(True, label)


# Sample data still carried the fake SHAP / XGBoost fields (no longer produced or shown).
remove_block("lib/mockdata.ts", "  shap_importance: {", "  },", "Sample data: remove shap_importance")
delete_line("lib/mockdata.ts", "  xgboost_prediction: 68,", "Sample data: remove xgboost_prediction")

# ------------------------------- 5. remove unused components with fake claims
delete_line("app/page.tsx", "import LiveAgentGraph from '@/components/LiveAgentGraph'",
            "Remove unused LiveAgentGraph import")
remove_file("components/LiveAgentGraph.tsx", "LiveAgentGraph", "Delete LiveAgentGraph.tsx (fake agent log)")
remove_file("components/PathHighlighting.tsx", "PathHighlighting", "Delete PathHighlighting.tsx (SHAP claims)")

# --------------------------------------------------------------------- summary
fails = results.count(False)
print()
print(f"{len(results) - fails} steps OK, {fails} failed.")
print("Backups of changed files are in ./patch_backup (.bak). Do not commit that folder.")
if fails:
    print("Some steps FAILED: send me the FAIL lines above.")
else:
    print("Next: cd frontend, npm run dev, upload a policy, open Dashboard > Overview.")