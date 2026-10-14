'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CompareResult } from '@/lib/types'
import { GitCompare, FileText, Trophy, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Scale } from 'lucide-react'

export default function Compare() {
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [selectedField, setSelectedField] = useState<string>('')
  const [result, setResult] = useState<CompareResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError('Please select both policy document files for head-to-head evaluation.')
      return
    }

    if (file1.name === file2.name && file1.size === file2.size) {
      setError('You selected the same file twice. Please upload two distinct policy bills.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file1', file1)
      form.append('file2', file2)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/compare', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }
      setResult(data)
      if (data.common_fields && data.common_fields.length > 0) {
        setSelectedField(data.common_fields[0])
      }
    } catch (err) {
      setError('Could not connect to backend engine.')
    }
    setLoading(false)
  }

  const field = result && selectedField ? result.comparison[selectedField] : null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 sm:px-6 lg:px-12 py-10 bg-grid-cyber relative overflow-hidden">
      {/* Aurora Ambient Background Glow */}
      <div className="absolute top-0 left-1/3 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 max-w-xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xs">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            Comparative Legal Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Dual Policy Head-to-Head
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Upload two draft legislation files to evaluate sectoral trade-offs and structural risk deltas
          </p>
        </motion.div>

        {/* Upload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Policy 1 */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg rounded-3xl p-7 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Policy Baseline 1
              </span>
              {file1 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>

            <label className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
              ${file1 ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}>
              {file1 ? (
                <div className="space-y-1.5">
                  <span className="text-3xl block">📄</span>
                  <p className="text-indigo-600 font-extrabold text-xs truncate max-w-xs mx-auto">{file1.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">{(file1.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-3xl block">📤</span>
                  <p className="text-slate-700 font-bold text-xs">Upload Draft Bill 1</p>
                  <p className="text-slate-400 text-[10px]">PDF, DOCX, or TXT format</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={(e) => e.target.files?.[0] && setFile1(e.target.files[0])}
              />
            </label>
          </motion.div>

          {/* Policy 2 */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg rounded-3xl p-7 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Policy Alternative 2
              </span>
              {file2 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>

            <label className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
              ${file2 ? 'border-purple-500 bg-purple-50/50' : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'}`}>
              {file2 ? (
                <div className="space-y-1.5">
                  <span className="text-3xl block">📄</span>
                  <p className="text-purple-600 font-extrabold text-xs truncate max-w-xs mx-auto">{file2.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">{(file2.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-3xl block">📤</span>
                  <p className="text-slate-700 font-bold text-xs">Upload Draft Bill 2</p>
                  <p className="text-slate-400 text-[10px]">PDF, DOCX, or TXT format</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={(e) => e.target.files?.[0] && setFile2(e.target.files[0])}
              />
            </label>
          </motion.div>
        </div>

        {/* Compare Trigger Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCompare}
            disabled={loading || !file1 || !file2}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-indigo-500/25 disabled:shadow-none"
          >
            {loading ? (
              <Sparkles className="w-4 h-4 animate-spin text-white" />
            ) : (
              <GitCompare className="w-4 h-4 text-white" />
            )}
            <span>{loading ? 'Synthesizing Head-to-Head...' : 'Execute Comparative Analysis'}</span>
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-5 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xs"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Results Visualization */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Policy Title Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-5 text-center shadow-xs">
                <p className="text-indigo-600 text-[10px] uppercase font-black tracking-wider mb-1">Baseline Document 1</p>
                <p className="text-slate-900 font-extrabold text-base">{result.policy1_title}</p>
              </div>
              <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-5 text-center shadow-xs">
                <p className="text-purple-600 text-[10px] uppercase font-black tracking-wider mb-1">Alternative Document 2</p>
                <p className="text-slate-900 font-extrabold text-base">{result.policy2_title}</p>
              </div>
            </div>

            {/* Field Selector Tabs */}
            <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg rounded-3xl p-6 space-y-4">
              <p className="text-slate-900 font-extrabold text-xs uppercase tracking-wider">Select Evaluation Dimension:</p>
              <div className="flex flex-wrap gap-2.5">
                {result.common_fields.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedField(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedField === f
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Field Comparison Cards */}
            {field && (
              <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg rounded-3xl p-7 space-y-6">
                <h2 className="text-base font-black text-slate-900 text-center tracking-tight">
                  {selectedField} — Direct Comparison
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Policy 1 Card */}
                  <div className={`rounded-2xl p-6 border transition-all ${field.winner === 'policy1' ? 'border-indigo-500 bg-indigo-50/40 shadow-md shadow-indigo-500/10' : 'border-slate-200 bg-slate-50/80'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-indigo-600 font-extrabold text-xs">Policy 1 Score</p>
                      {field.winner === 'policy1' && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-indigo-200 uppercase tracking-wider flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-indigo-600" /> Optimal Option
                        </span>
                      )}
                    </div>
                    <p className="text-5xl font-black text-slate-900 mb-3 tracking-tight">{field.policy1_score}<span className="text-slate-400 text-base font-normal">/100</span></p>
                    <div className="bg-slate-200/80 rounded-full h-2 mb-4 overflow-hidden">
                      <motion.div
                        className="bg-indigo-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${field.policy1_score}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">{field.policy1_summary}</p>
                  </div>

                  {/* Policy 2 Card */}
                  <div className={`rounded-2xl p-6 border transition-all ${field.winner === 'policy2' ? 'border-purple-500 bg-purple-50/40 shadow-md shadow-purple-500/10' : 'border-slate-200 bg-slate-50/80'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-purple-600 font-extrabold text-xs">Policy 2 Score</p>
                      {field.winner === 'policy2' && (
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-purple-200 uppercase tracking-wider flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-purple-600" /> Optimal Option
                        </span>
                      )}
                    </div>
                    <p className="text-5xl font-black text-slate-900 mb-3 tracking-tight">{field.policy2_score}<span className="text-slate-400 text-base font-normal">/100</span></p>
                    <div className="bg-slate-200/80 rounded-full h-2 mb-4 overflow-hidden">
                      <motion.div
                        className="bg-purple-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${field.policy2_score}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">{field.policy2_summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Winner Callout Card */}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/80 shadow-xl rounded-3xl p-7 text-center space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest block">Comparative Victor</span>
              <p className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span>{result.overall_winner === 'policy1' ? result.policy1_title : result.policy2_title}</span>
              </p>
              <p className="text-slate-600 text-xs max-w-xl mx-auto leading-relaxed font-medium pt-1">{result.overall_winner_reason}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}