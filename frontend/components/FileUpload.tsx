'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react'

export default function FileUpload({ onUpload, disabled }: { onUpload: (file: File) => void, disabled?: boolean }) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]

  const handleFile = (file: File) => {
    if (disabled) return

    if (!validTypes.includes(file.type)) {
      setError('Only PDF, DOCX, or TXT document formats are allowed.')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File payload exceeds maximum limit of 10MB.')
      return
    }

    setError('')
    setSelectedFile(file)
    onUpload(file)
  }

  return (
    <div>
      <motion.div
        whileHover={disabled ? {} : { scale: 1.008 }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 shadow-xl overflow-hidden
          ${disabled
            ? 'border-slate-200 bg-slate-100/50 cursor-not-allowed opacity-70'
            : dragOver
            ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01] shadow-indigo-500/10 cursor-pointer'
            : 'border-slate-300/80 bg-white/90 backdrop-blur-md hover:border-indigo-400 hover:shadow-indigo-500/5 cursor-pointer'
          }`}
      >
        {/* Ambient Glow & Scanner Beam Overlay when processing */}
        {disabled && (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-purple-500/10 to-transparent animate-scanline pointer-events-none" />
        )}

        <div className="flex justify-center mb-6">
          <motion.div
            animate={dragOver ? { y: -8, scale: 1.1 } : { y: [0, -4, 0] }}
            transition={dragOver ? { duration: 0.2 } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-md shadow-indigo-500/10"
          >
            {selectedFile ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <UploadCloud className="w-10 h-10" />
            )}
          </motion.div>
        </div>

        <h3 className="text-slate-900 font-extrabold text-xl mb-1.5 tracking-tight">
          {dragOver ? 'Release to Start AI Parsing' : selectedFile ? selectedFile.name : 'Upload Policy Document'}
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm mb-6 max-w-sm mx-auto font-medium leading-relaxed">
          Drag & drop your legislative draft bill or regulatory framework file to synthesize economic predictions
        </p>

        <label className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg ${
          disabled
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white cursor-pointer shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105'
        }`}>
          <Sparkles className="w-4 h-4" />
          <span>Browse Document</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt"
            disabled={disabled}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>

        <div className="flex items-center justify-center gap-4 mt-6 text-[11px] font-bold text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
            <FileText className="w-3.5 h-3.5 text-indigo-500" /> PDF
          </span>
          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
            <FileText className="w-3.5 h-3.5 text-purple-500" /> DOCX
          </span>
          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
            <FileText className="w-3.5 h-3.5 text-blue-500" /> TXT
          </span>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  )
}