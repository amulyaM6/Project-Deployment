'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TwoStageScenario } from '@/lib/types'
import { History, Sparkles, Volume2, VolumeX, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function TwoStageScenarioCard({ scenario }: { scenario?: TwoStageScenario }) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  if (!scenario) return null

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const fullStory = `Stage 1: Before Policy Implementation. ${scenario.stage1_before}. Stage 2: After Policy Implementation. ${scenario.stage2_after}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-7 shadow-lg shadow-slate-900/5 mb-6 relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Two-Stage Scenario Generation</h2>
            <p className="text-slate-400 text-xs font-medium">Life before policy vs anticipated outcomes after policy</p>
          </div>
        </div>

        {/* Narrative TTS Speech Synthesizer Button */}
        <button
          onClick={() => handleSpeak(fullStory)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isSpeaking
              ? 'bg-rose-50 border border-rose-200 text-rose-700 animate-pulse'
              : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
          <span>{isSpeaking ? 'Stop Narration' : 'Listen to Narrative Story (TTS)'}</span>
        </button>
      </div>

      {/* Two-Stage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Stage 1: Before Policy */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 rounded-2xl p-6 space-y-3 relative shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-200/80 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Stage 1: Before Policy (Problems)
            </span>
            <span className="text-[10px] font-bold text-slate-400">Baseline Context</span>
          </div>
          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
            {scenario.stage1_before}
          </p>
        </motion.div>

        {/* Stage 2: After Policy */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-200/80 rounded-2xl p-6 space-y-3 relative shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/90 px-3 py-1 rounded-full border border-indigo-200/80 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              Stage 2: After Policy (Outcomes)
            </span>
            <span className="text-[10px] font-bold text-slate-400">Simulated Impact</span>
          </div>
          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
            {scenario.stage2_after}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
