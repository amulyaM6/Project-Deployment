'use client'

import { motion } from 'framer-motion'
import { GitCommit, Layers, Database, ShieldCheck, Cpu, ArrowRight } from 'lucide-react'

export default function PathHighlighting({ shapImportance }: { shapImportance?: Record<string, number> }) {
  const defaultShap = {
    'Regulatory Clause Scope': 0.35,
    'Target Population Density': 0.28,
    'Fiscal Outlay & Budget': 0.18,
    'Environmental Risk Factor': 0.11,
    'Digital Access Index': 0.08
  }

  const shapData = shapImportance || defaultShap

  const pathSteps = [
    { title: '1. Policy Document Clause Parsing', detail: 'Vector embeddings extracted via Groq PyMuPDF pipeline', icon: Layers },
    { title: '2. Vector RAG Context Search', detail: 'Retrieved historical policy precedent chunks in ChromaDB', icon: Cpu },
    { title: '3. Real Dataset Grounding', detail: 'Cross-checked against RBI, NFHS, UDISE & NITI Aayog Index', icon: Database },
    { title: '4. SHAP ML Feature Weighting', detail: 'Computed SHAP additive feature importances for risk dimensions', icon: GitCommit },
    { title: '5. Rule-Based Formula Synthesis', detail: 'Applied 4-dimension weighted formula: Score = S×0.35 + P×0.3 + M×0.2 + V×0.15', icon: ShieldCheck }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-7 shadow-lg shadow-slate-900/5 mb-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Interactive Path-Highlighting & SHAP Interpretability</h2>
            <p className="text-slate-400 text-xs font-medium">Transparent decision path resolving black-box AI opacity</p>
          </div>
        </div>
        <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
          SHAP Model Explainability
        </span>
      </div>

      {/* Decision Path Step Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {pathSteps.map((step, idx) => {
          const Icon = step.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 transition-colors"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-slate-900 font-bold text-xs mb-1">{step.title}</h3>
                <p className="text-slate-500 text-[11px] leading-snug">{step.detail}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* SHAP Feature Importances Bar Decomposition */}
      <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 space-y-3">
        <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider block">
          SHAP Feature Weight Contributions
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(shapData).map(([feat, val]) => {
            const pct = Math.round(Math.abs(val) * 100)
            return (
              <div key={feat} className="bg-white border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span className="truncate text-[11px]">{feat}</span>
                  <span className="text-indigo-600 font-extrabold">{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
