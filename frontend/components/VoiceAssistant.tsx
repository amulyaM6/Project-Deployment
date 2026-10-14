'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare } from 'lucide-react'

interface VoiceAssistantProps {
  onTranscript?: (text: string) => void
  textToRead?: string
}

export default function VoiceAssistant({ onTranscript, textToRead }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = true
        rec.lang = 'en-IN'

        rec.onresult = (event: any) => {
          const current = event.resultIndex
          const text = event.results[current][0].transcript
          setTranscript(text)
          if (onTranscript && event.results[current].isFinal) {
            onTranscript(text)
          }
        }

        rec.onerror = () => setIsListening(false)
        rec.onend = () => setIsListening(false)

        setRecognition(rec)
      }
    }
  }, [onTranscript])

  const toggleMic = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      recognition.start()
      setIsListening(true)
    }
  }

  const toggleTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !textToRead) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(textToRead)
      utterance.rate = 0.95
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Web Speech API Microphone STT Button */}
      {recognition && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMic}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isListening
              ? 'bg-rose-500 text-white shadow-rose-500/25 animate-pulse'
              : 'bg-white/90 text-slate-700 hover:text-indigo-600 border border-slate-200/80 hover:bg-white'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-indigo-600" />}
          <span>{isListening ? 'Listening...' : 'Voice Search (STT)'}</span>
        </motion.button>
      )}

      {/* Web Speech API Narrative TTS Button */}
      {textToRead && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTTS}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isSpeaking
              ? 'bg-indigo-600 text-white shadow-indigo-500/25 animate-pulse'
              : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
          <span>{isSpeaking ? 'Stop Speech' : 'Listen Narration (TTS)'}</span>
        </motion.button>
      )}

      {transcript && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 max-w-xs truncate shadow-2xs">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">"{transcript}"</span>
        </div>
      )}
    </div>
  )
}
