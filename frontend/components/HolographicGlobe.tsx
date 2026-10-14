'use client'

import { useState, useEffect } from 'react'
import { sounds } from './SciFiSoundEffects'

interface StatePoint {
  name: string
  code: string
  x: number
  y: number
  impactScore: number
  color: string
}

export default function HolographicGlobe() {
  const [activeArc, setActiveArc] = useState<number>(0)

  const states: StatePoint[] = [
    { name: 'Delhi (Center)', code: 'DEL', x: 180, y: 110, impactScore: 88, color: '#00f3ff' },
    { name: 'Punjab (Agri Hub)', code: 'PUN', x: 140, y: 80, impactScore: 94, color: '#10b981' },
    { name: 'Maharashtra (Fin Tech)', code: 'MAH', x: 160, y: 220, impactScore: 82, color: '#6366f1' },
    { name: 'Karnataka (AI Tech)', code: 'KAR', x: 175, y: 280, impactScore: 96, color: '#ec4899' },
    { name: 'Tamil Nadu (Mfg)', code: 'TN', x: 200, y: 310, impactScore: 78, color: '#a855f7' },
    { name: 'Gujarat (Ports/Infra)', code: 'GUJ', x: 110, y: 180, impactScore: 85, color: '#f59e0b' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveArc((prev) => (prev + 1) % states.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [states.length])

  const targetState = states[(activeArc + 1) % states.length]
  const originState = states[activeArc]

  return (
    <div className="neon-laser-card shadow-2xl relative">
      <div className="neon-laser-inner p-6 lg:p-8 space-y-6">
        
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-indigo-600 animate-ping" />
            <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-widest">
              INTER-STATE POLICY CASCADE LASER MATRIX
            </h3>
          </div>
          <div className="text-xs text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 font-medium">
            ACTIVE CASCADE: <span className="text-indigo-600 font-bold">{originState.code} → {targetState.code}</span>
          </div>
        </div>

        {/* Holographic Interactive Map Visualizer */}
        <div className="relative h-80 w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden bg-grid-cyber flex items-center justify-center shadow-inner">
          
          {/* Animated Background Cyber Target Rings */}
          <div className="absolute w-72 h-72 rounded-full border border-cyan-500/20 animate-ping opacity-20 pointer-events-none" />
          <div className="absolute w-96 h-96 rounded-full border border-indigo-500/20 animate-pulse pointer-events-none" />

          {/* SVG Laser Arc Network */}
          <svg className="w-full h-full absolute inset-0 z-10">
            <defs>
              <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connecting Lines between all states */}
            {states.map((s1, i) =>
              states.slice(i + 1).map((s2, j) => (
                <line
                  key={`${i}-${j}`}
                  x1={`${(s1.x / 300) * 100}%`}
                  y1={`${(s1.y / 350) * 100}%`}
                  x2={`${(s2.x / 300) * 100}%`}
                  y2={`${(s2.y / 350) * 100}%`}
                  stroke="rgba(0, 243, 255, 0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))
            )}

            {/* Active Pulsing Laser Arc */}
            <path
              d={`M ${(originState.x / 300) * 400} ${(originState.y / 350) * 320} Q ${(originState.x + targetState.x) / 1.6} ${
                Math.min(originState.y, targetState.y) - 40
              } ${(targetState.x / 300) * 400} ${(targetState.y / 350) * 320}`}
              fill="none"
              stroke="url(#laserGrad)"
              strokeWidth="3"
              filter="url(#glow)"
              className="animate-pulse"
            />
          </svg>

          {/* Render State Nodes */}
          {states.map((state, idx) => {
            const isOrigin = idx === activeArc
            return (
              <div
                key={state.code}
                onMouseEnter={() => sounds.playHover()}
                style={{
                  left: `${(state.x / 300) * 100}%`,
                  top: `${(state.y / 350) * 100}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-[10px] font-bold border transition-all duration-300 ${
                    isOrigin
                      ? 'bg-indigo-600 border-indigo-400 text-white scale-125 shadow-lg shadow-indigo-500/50 animate-bounce'
                      : 'bg-slate-950/90 border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-white'
                  }`}
                >
                  {state.code}
                </div>

                {/* State Glow Badge */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-[10px] text-cyan-300 whitespace-nowrap shadow-2xl z-30">
                  <div className="font-bold text-white">{state.name}</div>
                  <div>Impact Index: <span className="text-emerald-400 font-bold">{state.impactScore}%</span></div>
                  <div className="text-[9px] text-slate-400">Inter-State Spillover: HIGH</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* State Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono">
          {states.map((s) => (
            <div
              key={s.code}
              onMouseEnter={() => sounds.playHover()}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center hover:border-indigo-400 transition-all hover:-translate-y-1 shadow-sm"
            >
              <div className="text-[10px] text-slate-500 font-bold">{s.code}</div>
              <div className="text-base font-black text-indigo-600 mt-0.5">{s.impactScore}%</div>
              <div className="text-[9px] text-emerald-600 font-semibold">Stable</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
