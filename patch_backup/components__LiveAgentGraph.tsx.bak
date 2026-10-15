'use client'

import { useState, useEffect } from 'react'

interface AgentNode {
  id: number
  type: 'Farmer' | 'Enterprise' | 'Consumer' | 'Bank' | 'TaxAuthority'
  x: number
  y: number
  status: 'stable' | 'stressed' | 'thriving'
  impactScore: number
}

export default function LiveAgentGraph() {
  const [agents, setAgents] = useState<AgentNode[]>([
    { id: 1, type: 'Farmer', x: 20, y: 30, status: 'stable', impactScore: 78 },
    { id: 2, type: 'Farmer', x: 40, y: 70, status: 'thriving', impactScore: 88 },
    { id: 3, type: 'Enterprise', x: 70, y: 25, status: 'stable', impactScore: 65 },
    { id: 4, type: 'Consumer', x: 80, y: 75, status: 'stable', impactScore: 70 },
    { id: 5, type: 'Bank', x: 50, y: 45, status: 'thriving', impactScore: 92 },
    { id: 6, type: 'TaxAuthority', x: 30, y: 85, status: 'stable', impactScore: 60 },
  ])

  const [simulationStep, setSimulationStep] = useState(1420)
  const [activeLog, setActiveLog] = useState<string[]>([
    '[INIT_ABM] Instantiating 10,000 micro-agents across 28 states...',
    '[GROUNDING] RBI Handbook of Statistics baseline linked.',
    '[MONTE_CARLO] Running trial batch #8,941/10,000...',
  ])

  const injectShock = (shockType: string) => {
    setAgents((prev) =>
      prev.map((agent) => {
        const newScore = Math.max(10, Math.min(100, agent.impactScore + (Math.random() * 30 - 20)))
        const newStatus = newScore < 50 ? 'stressed' : newScore > 80 ? 'thriving' : 'stable'
        return { ...agent, impactScore: Math.round(newScore), status: newStatus }
      })
    )
    setSimulationStep((prev) => prev + 100)
    setActiveLog((prev) => [
      `[SHOCK_INJECTED] ${shockType} applied to network graph.`,
      `[RE-SIMULATING] Micro-agents adjusting state balances...`,
      ...prev.slice(0, 4),
    ])
  }

  return (
    <div className="neon-laser-card shadow-xl">
      <div className="neon-laser-inner p-6 lg:p-8 space-y-6">
        
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600" />
            </div>
            <h3 className="font-mono text-sm uppercase tracking-widest text-indigo-800 font-bold">
              LIVE ABM AGENT TOPOLOGY & CASCADE VISUALIZER
            </h3>
          </div>
          <div className="font-mono text-xs text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            SIMULATION STEP: <span className="text-indigo-600 font-bold">#{simulationStep}</span>
          </div>
        </div>

        {/* Shock Injection Control Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => injectShock('Agricultural Subsidy Reduction (-15%)')}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-mono font-bold transition-all hover:scale-105 shadow-sm"
          >
            ⚡ Shock: Subsidy Reduction
          </button>
          <button
            onClick={() => injectShock('Monsoon Delay (+12 Days)')}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-mono font-bold transition-all hover:scale-105 shadow-sm"
          >
            🌧️ Shock: Monsoon Delay
          </button>
          <button
            onClick={() => injectShock('Global Fertilizer Price Spike (+22%)')}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-mono font-bold transition-all hover:scale-105 shadow-sm"
          >
            💥 Shock: Price Inflation
          </button>
        </div>

        {/* Visual Network Grid Stage */}
        <div className="relative h-64 w-full bg-slate-100/90 rounded-2xl border border-slate-200 overflow-hidden bg-grid-cyber">
          {/* Radar Sweep Circle overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-indigo-200 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-t-2 border-indigo-600 animate-radar opacity-40 pointer-events-none" />

          {/* Render Agent Nodes */}
          {agents.map((agent) => (
            <div
              key={agent.id}
              style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            >
              {/* Glowing Pulse Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 shadow-sm ${
                  agent.status === 'thriving'
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-black'
                    : agent.status === 'stressed'
                    ? 'bg-rose-100 border-rose-500 text-rose-800 font-black animate-pulse'
                    : 'bg-indigo-100 border-indigo-500 text-indigo-800 font-black'
                }`}
              >
                <span className="text-[10px] font-mono font-bold">{agent.type[0]}</span>
              </div>

              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-xl pointer-events-none z-20">
                <div>Type: {agent.type}</div>
                <div>Status: {agent.status.toUpperCase()}</div>
                <div>Score: {agent.impactScore}/100</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Terminal Output */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-1 text-emerald-400 h-24 overflow-hidden relative shadow-inner">
          <div className="text-[10px] text-slate-400 mb-1 border-b border-slate-800 pb-1 flex justify-between">
            <span>REAL-TIME AGENT EVENT BUS LOGS</span>
            <span className="text-emerald-400 font-bold">STATUS: ACTIVE</span>
          </div>
          {activeLog.map((log, idx) => (
            <div key={idx} className="truncate">
              <span className="text-slate-500">&gt; </span>
              {log}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
