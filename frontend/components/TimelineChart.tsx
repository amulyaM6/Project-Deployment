'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from 'recharts'
import { motion } from 'framer-motion'
import { TimelinePoint } from '@/lib/types'
import { Calendar, TrendingUp } from 'lucide-react'

export default function TimelineChart({ timeline }: { timeline: TimelinePoint[] }) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload
      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-3.5 max-w-xs space-y-1">
          <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-wider block">{point.period}</span>
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-1">
            <span>Projected Impact:</span>
            <span className={`text-sm ${point.impact_score > 70 ? 'text-rose-600' : point.impact_score > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {point.impact_score}/100
            </span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed pt-1">{point.description}</p>
        </div>
      )
    }
    return null
  }

  const maxScore = Math.max(...timeline.map(t => t.impact_score))
  const trend = maxScore > 70 ? 'Critical Projection' : maxScore > 40 ? 'Moderate Impact' : 'Low Impact Trajectory'
  const trendBadge = maxScore > 70 ? 'bg-rose-50 border-rose-200 text-rose-700' : maxScore > 40 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 mb-6 shadow-lg shadow-slate-900/5"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Multi-Year Impact Trajectory</h2>
            <p className="text-slate-400 text-xs font-medium">Predictive timeline modeling across implementation phases</p>
          </div>
        </div>
        <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${trendBadge} uppercase tracking-wider flex items-center gap-1.5 shadow-2xs`}>
          <TrendingUp className="w-3.5 h-3.5" />
          {trend}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Critical (70+)', fill: '#f43f5e', fontSize: 10, fontWeight: 700 }} />
          <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Moderate (40)', fill: '#f59e0b', fontSize: 10, fontWeight: 700 }} />
          <Area
            type="monotone"
            dataKey="impact_score"
            stroke="#4f46e5"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorImpact)"
            dot={{ fill: '#4f46e5', r: 5, strokeWidth: 2, stroke: '#ffffff' }}
            activeDot={{ r: 8, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Timeline points summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5">
        {timeline.map((t, i) => (
          <div key={i} className="text-center bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 transition-all hover:bg-white hover:shadow-xs">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">{t.period}</p>
            <p className={`text-base font-black ${t.impact_score > 70 ? 'text-rose-600' : t.impact_score > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {t.impact_score}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}