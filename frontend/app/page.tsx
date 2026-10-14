'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import QuantumParticleCanvas from '@/components/QuantumParticleCanvas'
import LiveAgentGraph from '@/components/LiveAgentGraph'
import HolographicGlobe from '@/components/HolographicGlobe'
import MonteCarloFanChart from '@/components/MonteCarloFanChart'
import SplitPolicySlider from '@/components/SplitPolicySlider'
import { sounds } from '@/components/SciFiSoundEffects'
import { ArrowRight, Sparkles, Layers, Cpu, Activity, Globe2, GitCompare, ShieldAlert } from 'lucide-react'

interface PresetPolicy {
  id: string
  title: string
  category: string
  baseRisk: number
  sectorImpacts: { name: string; score: number; sentiment: 'positive' | 'negative' | 'neutral' }[]
  topAffectedStates: { name: string; score: number }[]
  monteCarloProbability: number
  description: string
}

const PRESET_POLICIES: PresetPolicy[] = [
  {
    id: 'agri-2026',
    title: 'Agricultural Subsidy & Direct Transfer Act 2026',
    category: 'Agriculture & Rural Economy',
    baseRisk: 68,
    description: 'Reallocates chemical fertilizer subsidies to direct cash transfers for 85M smallholder farmers.',
    sectorImpacts: [
      { name: 'Agriculture', score: 88, sentiment: 'positive' },
      { name: 'Economy', score: 65, sentiment: 'neutral' },
      { name: 'Infrastructure', score: 48, sentiment: 'neutral' },
      { name: 'Environment', score: 92, sentiment: 'positive' },
    ],
    topAffectedStates: [
      { name: 'Punjab', score: 94 },
      { name: 'Uttar Pradesh', score: 86 },
      { name: 'Maharashtra', score: 78 },
    ],
    monteCarloProbability: 86.4,
  },
  {
    id: 'ai-compute',
    title: 'National AI Infrastructure & Compute Grid Bill',
    category: 'Technology & DeepTech',
    baseRisk: 38,
    description: 'Subsidizes 10,000 GPU data center clusters and renewable energy tariffs for tier-2/3 tech hubs.',
    sectorImpacts: [
      { name: 'Technology', score: 96, sentiment: 'positive' },
      { name: 'Economy', score: 91, sentiment: 'positive' },
      { name: 'Energy', score: 70, sentiment: 'negative' },
      { name: 'Education', score: 84, sentiment: 'positive' },
    ],
    topAffectedStates: [
      { name: 'Karnataka', score: 98 },
      { name: 'Telangana', score: 93 },
      { name: 'Tamil Nadu', score: 85 },
    ],
    monteCarloProbability: 92.8,
  },
  {
    id: 'green-tariff',
    title: 'Renewable Storage Mandate & Carbon Tariff 2026',
    category: 'Energy & Climate Reform',
    baseRisk: 58,
    description: 'Imposes carbon tariffs on heavy manufacturing while mandating 25% battery storage for power grids.',
    sectorImpacts: [
      { name: 'Environment', score: 95, sentiment: 'positive' },
      { name: 'Manufacturing', score: 62, sentiment: 'negative' },
      { name: 'Energy', score: 84, sentiment: 'positive' },
      { name: 'Economy', score: 58, sentiment: 'neutral' },
    ],
    topAffectedStates: [
      { name: 'Gujarat', score: 91 },
      { name: 'Maharashtra', score: 85 },
      { name: 'Rajasthan', score: 81 },
    ],
    monteCarloProbability: 81.2,
  },
]

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<PresetPolicy>(PRESET_POLICIES[0])
  const [volatilityFactor, setVolatilityFactor] = useState<number>(15)

  // Live simulation math adjustments based on user slider
  const dynamicRisk = Math.min(100, Math.max(0, Math.round(selectedPreset.baseRisk + (volatilityFactor - 15) * 0.4)))
  const dynamicConfidence = (selectedPreset.monteCarloProbability - (volatilityFactor - 15) * 0.25).toFixed(1)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden bg-grid-cyber">
      {/* ── Background Quantum Particle Network Canvas ── */}
      <QuantumParticleCanvas />

      {/* ── Scanline CRT Overlay ── */}
      <div className="scanline-overlay" />

      {/* ── Glowing Multi-Color Aurora Ambient Background Auras ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1300px] h-[650px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/10 rounded-full blur-[170px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[900px] -right-40 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[190px] pointer-events-none" />

      {/* ── 1. HERO SECTION ── */}
      <section className="relative pt-20 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center z-10">
        
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-black uppercase tracking-widest mb-8 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          Autonomous Multi-Agent Legal Simulation Engine
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.08] mb-8 text-slate-900"
        >
          Simulate Policy Impact
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 via-pink-600 to-blue-600 animate-text-glow">
            Before It Becomes National Law
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-slate-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-12 font-medium"
        >
          Upload any government policy PDF or draft bill. Our AI pipeline instantiates economic agents, parses regulatory clauses into vector embeddings, and executes 10,000 Monte Carlo iterations across 28 Indian states.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-5 mb-16"
        >
          <Link href="/upload">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => sounds.playHover()}
              onClick={() => sounds.playExecute()}
              className="relative group px-9 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 group-hover:opacity-95 transition-opacity" />
              <span className="relative flex items-center gap-3 text-white">
                <Cpu className="w-4 h-4" />
                <span>Upload Policy Document</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>

          <Link href="/compare">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onMouseEnter={() => sounds.playHover()}
              onClick={() => sounds.playExecute()}
              className="hud-panel hud-panel-glow px-9 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-800 hover:text-indigo-600 border border-slate-200 flex items-center gap-3 shadow-xs"
            >
              <GitCompare className="w-4 h-4 text-indigo-600" />
              <span>Compare Two Draft Bills</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Live Counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-8 border-t border-slate-200/80 text-left font-mono"
        >
          <div className="hud-panel hud-panel-glow p-5 rounded-2xl border border-indigo-200/80 shadow-xs">
            <div className="text-3xl font-black text-indigo-600">10,000+</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-wider">Monte Carlo Iterations</div>
          </div>
          <div className="hud-panel hud-panel-glow p-5 rounded-2xl border border-purple-200/80 shadow-xs">
            <div className="text-3xl font-black text-purple-600">28 States</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-wider">Regional Heatmap Resolution</div>
          </div>
          <div className="hud-panel hud-panel-glow p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
            <div className="text-3xl font-black text-emerald-600">RBI Data</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-wider">Grounded Statistical Baseline</div>
          </div>
          <div className="hud-panel hud-panel-glow p-5 rounded-2xl border border-pink-200/80 shadow-xs">
            <div className="text-3xl font-black text-pink-600">5 Sectors</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-wider">Agri, Eco, Health, Infra, Edu</div>
          </div>
        </motion.div>
      </section>

      

  
    </div>
  )
}