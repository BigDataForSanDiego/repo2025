'use client'

import Link from 'next/link'
import { AlertTriangle, Home, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function HomePage() {
  const [emergencyPressed, setEmergencyPressed] = useState(false)

  return (
    <div className="relative flex flex-col min-h-[100dvh] bg-gradient-to-b from-[#1a1d2e] via-[#1e2238] to-[#1a1d2e] light:from-gray-50 light:via-white light:to-gray-50 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7a9278]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#d4554f]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content - perfectly centered */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-5 py-8 pt-safe pb-safe">
        <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-8 sm:space-y-10">

          {/* App branding with icon */}
          <div className="flex flex-col items-center gap-4 animate-slide-up">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7a9278] to-[#6a8268] flex items-center justify-center shadow-2xl">
                <Heart className="h-8 w-8 text-white fill-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-[#7a9278] to-[#6a8268] rounded-2xl blur opacity-30" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-center text-white light:text-[#1a1d2e] text-balance leading-tight">
              Home Base
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-center text-white/90 light:text-[#1a1d2e]/80 text-balance font-medium px-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            What do you need right now?
          </p>

          {/* Action buttons */}
          <div className="w-full space-y-5 sm:space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>

            {/* Emergency button with pulse effect */}
            <Link href="/emergency" className="block tap-highlight-transparent">
              <Button
                size="lg"
                onTouchStart={() => setEmergencyPressed(true)}
                onTouchEnd={() => setEmergencyPressed(false)}
                className={`
                  relative w-full h-40 sm:h-44
                  bg-gradient-to-br from-[#d4554f] to-[#c04842]
                  hover:from-[#c04842] hover:to-[#b03d37]
                  active:scale-[0.98]
                  text-white text-lg font-semibold
                  rounded-[2rem]
                  flex flex-col items-center justify-center gap-4
                  shadow-2xl shadow-[#d4554f]/20
                  transition-all duration-200 ease-out
                  border-2 border-white/10
                  overflow-hidden
                  ${emergencyPressed ? 'scale-[0.98]' : ''}
                `}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

                {/* Icon with glow */}
                <div className="relative">
                  <AlertTriangle className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-2xl relative z-10" strokeWidth={2.5} />
                  <div className="absolute inset-0 blur-xl bg-white/40" />
                </div>

                <div className="text-center relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight">Get Help Now</div>
                  <div className="text-base sm:text-lg font-medium opacity-95 mt-1">
                    Emergency assistance available
                  </div>
                </div>

                {/* Pulse indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-medium uppercase tracking-wider">24/7</span>
                </div>
              </Button>
            </Link>

            {/* Resources button */}
            <Link href="/resources" className="block tap-highlight-transparent">
              <Button
                size="lg"
                className="
                  relative w-full h-40 sm:h-44
                  bg-gradient-to-br from-[#7a9278] to-[#6a8268]
                  hover:from-[#6a8268] hover:to-[#5a7258]
                  active:scale-[0.98]
                  text-white light:text-[#1a1d2e]
                  text-lg font-semibold
                  rounded-[2rem]
                  flex flex-col items-center justify-center gap-4
                  shadow-2xl shadow-[#7a9278]/20
                  transition-all duration-200 ease-out
                  border-2 border-white/10
                  overflow-hidden
                "
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

                {/* Icon with glow */}
                <div className="relative">
                  <Home className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-2xl relative z-10" strokeWidth={2.5} />
                  <div className="absolute inset-0 blur-xl bg-white/40" />
                </div>

                <div className="text-center relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Essentials</div>
                  <div className="text-base sm:text-lg font-medium opacity-95 mt-1">
                    Shelter, food, hygiene & more
                  </div>
                </div>
              </Button>
            </Link>
          </div>

          {/* Help text */}
          <p className="text-center text-sm text-white/60 light:text-[#1a1d2e]/60 px-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            Safe, confidential, and always here for you
          </p>
        </div>
      </main>
    </div>
  )
}
