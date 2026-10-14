'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Stakeholder } from '@/lib/types'
import { Users, AlertTriangle, ShieldCheck, ShieldAlert, ChevronDown } from 'lucide-react'

export default function StakeholderCard({ stakeholder }: { stakeholder: Stakeholder }) {
  const [expanded, setExpanded] = useState(false)

  const styles = {
    high: {
      card: 'bg-gradient-to-br from-rose-50/60 to-white border-rose-200/80 hover:border-rose-400',
      badge: 'bg-rose-100/80 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      icon: ShieldAlert
    },
    medium: {
      card: 'bg-gradient-to-br from-amber-50/60 to-white border-amber-200/80 hover:border-amber-400',
      badge: 'bg-amber-100/80 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: AlertTriangle
    },
    low: {
      card: 'bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200/80 hover:border-emerald-400',
      badge: 'bg-emerald-100/80 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: ShieldCheck
    }
  }

  const s = styles[stakeholder.severity] || styles.medium
  const Icon = s.icon

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl p-5 border ${s.card} shadow-sm backdrop-blur-xs transition-all cursor-pointer flex flex-col justify-between`}
      onClick={() => setExpanded(!expanded)}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-slate-900 font-extrabold text-sm tracking-tight">{stakeholder.group}</p>
          </div>
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${s.badge} uppercase tracking-wider flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            {stakeholder.severity} Impact
          </span>
        </div>

        <p className={`text-slate-600 text-xs leading-relaxed font-medium transition-all ${expanded ? '' : 'line-clamp-2'}`}>
          {stakeholder.impact}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200/40 text-[11px] text-slate-400 font-semibold">
        <span>Click for details</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </div>
    </motion.div>
  )
}