'use client'

import { useState } from 'react'
import { ArrowLeft, Volume2, Phone, MessageSquare, Globe, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EmergencyPage() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [userName] = useState('John')
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  const handlePressHelp = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newRipple = { id: Date.now(), x, y }
    setRipples(prev => [...prev, newRipple])
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)

    setIsListening(!isListening)
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setTranscript('User: I need a warm place to sleep tonight and something to eat.')
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1d2e]">
      <header className="flex items-center gap-4 p-4 border-b border-[#2a2d3e]">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-white" />
          <h1 className="text-lg font-semibold text-white">Emergency Help</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {userName && (
            <div className="text-center mb-8">
              <div className="inline-block px-6 py-3 border-2 border-white/20 rounded-2xl">
                <p className="text-2xl text-white font-medium">Hello, {userName}</p>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-white/80 text-lg">Tap the button below and speak.</p>
            
            <button
              onClick={handlePressHelp}
              className={`relative overflow-hidden mx-auto w-64 h-64 rounded-full bg-[#d4554f] hover:bg-[#c04842] text-white font-semibold text-xl shadow-2xl transition-all ${
                isListening ? 'scale-95 ring-4 ring-[#d4554f]/30' : ''
              }`}
            >
              <span className="relative z-10">Press for Help</span>
              
              {ripples.map(ripple => (
                <span
                  key={ripple.id}
                  className="absolute rounded-full bg-white/30 animate-ripple"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: '20px',
                    height: '20px',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </button>
          </div>

          {transcript && (
            <div className="mt-8 p-6 bg-[#2a2d3e] rounded-2xl border border-[#3a3d4e]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Transcription</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                {transcript}
              </p>
              <p className="text-white/40 text-xs text-right">#UFF590</p>
            </div>
          )}
        </div>
      </main>

      <nav className="border-t border-[#2a2d3e] bg-[#1a1d2e]">
        <div className="flex items-center justify-around h-20 max-w-md mx-auto">
          <Link href="/emergency">
            <button className="flex flex-col items-center gap-1 text-white">
              <Phone className="h-6 w-6" />
              <span className="text-xs">Call 911</span>
            </button>
          </Link>
          <button className="flex flex-col items-center gap-1 text-white/60">
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs">Text mode</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/60">
            <Globe className="h-6 w-6" />
            <span className="text-xs">Language</span>
          </button>
          <Link href="/">
            <button className="flex flex-col items-center gap-1 text-white/60">
              <Home className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  )
}
