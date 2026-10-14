'use client'

import { useState } from 'react'
import { sounds } from './SciFiSoundEffects'

export default function SplitPolicySlider() {
  const [sliderPos, setSliderPos] = useState<number>(50)

  return (
    <div className="neon-laser-card shadow-xl relative overflow-hidden my-12">
      <div className="neon-laser-inner p-6 lg:p-10 space-y-6">
        
        {/* Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 font-mono">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-indigo-600 animate-ping" />
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 uppercase tracking-widest">
              LIVE DRAFT A vs DRAFT B LASER SPLIT COMPARATOR
            </h3>
          </div>
          <span className="text-xs text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 font-medium">
            DRAG DIVIDER BELOW
          </span>
        </div>

        {/* Interactive Split Viewport */}
        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100))
            setSliderPos(x)
          }}
          className="relative h-72 w-full bg-slate-900 rounded-2xl border border-slate-200 overflow-hidden cursor-ew-resize select-none bg-grid-cyber shadow-inner"
        >
          {/* Draft A View (Left Side) */}
          <div
            style={{ width: `${sliderPos}%` }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-slate-900/95 via-indigo-950/90 to-purple-950/85 border-r-2 border-indigo-400 p-6 flex flex-col justify-between overflow-hidden shadow-2xl z-10"
          >
            <div>
              <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-pink-500/40">
                POLICY DRAFT A (EXISTING LAW)
              </span>
              <h4 className="text-xl font-black text-white mt-3 mb-1">Fertilizer Subsidy Act 2021</h4>
              <p className="text-xs text-slate-300">Centralized bulk supply allocation with fixed price caps.</p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-black/50 border border-pink-500/20 text-slate-200">
                <span>Agri Yield Score</span>
                <span className="text-pink-400 font-bold">54/100</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-black/50 border border-pink-500/20 text-slate-200">
                <span>Fiscal Risk Index</span>
                <span className="text-amber-400 font-bold">HIGH (78%)</span>
              </div>
            </div>
          </div>

          {/* Draft B View (Right Side - Underneath) */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-slate-900/95 to-slate-950/95 p-6 flex flex-col justify-between text-right overflow-hidden">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/40">
                POLICY DRAFT B (PROPOSED REFORM 2026)
              </span>
              <h4 className="text-xl font-black text-white mt-3 mb-1">Direct Benefit Transfer & Agri-DBT Bill</h4>
              <p className="text-xs text-slate-300">Direct cash transfer to farmer bank accounts with soil card incentives.</p>
            </div>

            <div className="space-y-2 font-mono text-xs max-w-xs ml-auto">
              <div className="flex justify-between p-2 rounded-lg bg-black/50 border border-emerald-500/20 text-slate-200">
                <span>Agri Yield Score</span>
                <span className="text-emerald-400 font-bold">92/100 (+38%)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-black/50 border border-emerald-500/20 text-slate-200">
                <span>Fiscal Risk Index</span>
                <span className="text-emerald-400 font-bold">LOW (24%)</span>
              </div>
            </div>
          </div>

          {/* Center Laser Slider Handle */}
          <div
            style={{ left: `${sliderPos}%` }}
            className="absolute top-0 bottom-0 -translate-x-1/2 w-1.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 z-20 pointer-events-none shadow-[0_0_20px_#6366f1]"
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-white flex items-center justify-center text-white font-black text-[10px] shadow-xl">
              ◄►
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
