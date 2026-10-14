'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { SectorScore } from '@/lib/types'
import { BarChart3, CheckCircle2, AlertCircle } from 'lucide-react'

export default function SectorChart({ sectors }: { sectors: SectorScore[] }) {
  const colors: Record<string, { bar: string; text: string }> = {
    positive: { bar: '#10b981', text: 'text-emerald-600' },
    neutral: { bar: '#f59e0b', text: 'text-amber-600' },
    negative: { bar: '#f43f5e', text: 'text-rose-600' },
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const grounded = data.data_grounded

      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-xl p-3.5 text-xs max-w-xs space-y-1.5">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-900 text-sm">{data.name}</span>
            <span className={`capitalize font-bold px-2 py-0.5 rounded-full text-[10px] ${
              data.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              data.sentiment === 'negative' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {data.sentiment}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Impact Score:</span>
            <span className="font-extrabold text-slate-900 text-sm">{data.score}/100</span>
          </div>
          {grounded !== undefined && (
            <div className={`flex items-center gap-1.5 text-[11px] pt-1 font-medium ${grounded ? 'text-emerald-700' : 'text-amber-700'}`}>
              {grounded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              <span>{grounded ? 'Grounded with Government Datasets' : 'AI Synthetic Estimation'}</span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 h-full shadow-lg shadow-slate-900/5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-50 to-purple-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Sector Impact Breakdown</h2>
            <p className="text-slate-400 text-xs font-medium">Multi-sector algorithmic projection</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500" />Positive</span>
          <span className="flex items-center gap-1 text-amber-700"><span className="w-2 h-2 rounded-full bg-amber-500" />Neutral</span>
          <span className="flex items-center gap-1 text-rose-700"><span className="w-2 h-2 rounded-full bg-rose-500" />Negative</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={sectors} layout="vertical" margin={{ left: 5, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)', rx: 8 }} />
          <Bar dataKey="score" radius={[0, 8, 8, 0]} maxBarSize={22}>
            {sectors.map((s, i) => (
              <Cell key={i} fill={colors[s.sentiment]?.bar || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}