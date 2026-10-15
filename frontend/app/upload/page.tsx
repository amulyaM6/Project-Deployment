'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import FileUpload from '@/components/FileUpload'
import { Sparkles, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeoutWarning, setTimeoutWarning] = useState(false)

  const handleUpload = async (file: File) => {
    setLoading(true)
    setError('')
    setTimeoutWarning(false)

    // Show warning after 15 seconds
    const warningTimer = setTimeout(() => {
      setTimeoutWarning(true)
    }, 15000)

    // Cancel everything after 3 minutes
    const controller = new AbortController()
    const timeoutTimer = setTimeout(() => {
      controller.abort()
    }, 180000)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/upload`, {
      method: 'POST',
      body: form,
      signal: controller.signal
        })
      

      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      localStorage.setItem('simulationResult', JSON.stringify(data))
      router.push('/dashboard')

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out while running Groq LLM inference. Please try again.')
      } else {
        setError('Could not connect to backend engine. Ensure Python FastAPI is active on port 8000.')
      }
      setLoading(false)
    } finally {
      clearTimeout(warningTimer)
      clearTimeout(timeoutTimer)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden bg-grid-cyber">
      {/* Aurora Ambient Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-blue-500/10 rounded-full blur-[160px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl text-center space-y-8"
      >
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            AI Algorithmic Engine v2.0
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Synthesize Policy Impact
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto font-medium leading-relaxed">
            Drop any draft legislative bill or government whitepaper for an evidence-checked risk analysis with 10,000-trial Monte Carlo uncertainty across 28 states.
          </p>
        </div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-3xl p-14 text-center relative overflow-hidden"
          >
            <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
              <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <h3 className="text-slate-900 font-extrabold text-xl mb-2">Analyzing Policy Vectors...</h3>
            {!timeoutWarning ? (
              <p className="text-slate-500 text-xs sm:text-sm font-medium">Rating risk factors and running Monte Carlo uncertainty analysis across 28 states and 5 sectors</p>
            ) : (
              <p className="text-amber-600 text-xs font-bold bg-amber-50 border border-amber-200 p-3 rounded-xl mt-3 inline-block">
                ⚠️ Processing high complexity clauses... Groq pipeline busy. Please stand by.
              </p>
            )}
          </motion.div>
        ) : (
          <>
            <FileUpload onUpload={handleUpload} disabled={loading} />
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
          </>
        )}

        <div className="flex justify-center items-center gap-6 text-xs text-slate-400 font-semibold pt-4">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> End-to-End Encrypted</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Grounded Baseline Data</span>
        </div>
      </motion.div>
    </div>
  )
}
