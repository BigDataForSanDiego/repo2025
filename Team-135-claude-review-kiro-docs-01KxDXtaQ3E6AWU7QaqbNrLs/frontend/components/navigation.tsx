'use client'

import { Contrast, Volume2, Type, Globe, Sparkles } from 'lucide-react'
import { useTheme } from './theme-provider'
import { useState } from 'react'

export function Navigation() {
  const { toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<string | null>(null)

  const tabs = [
    { id: 'voice', icon: Volume2, label: 'Voice', action: () => {} },
    { id: 'text', icon: Type, label: 'Text', action: () => {} },
    { id: 'language', icon: Globe, label: 'Language', action: () => {} },
    { id: 'contrast', icon: Contrast, label: 'Theme', action: toggleTheme },
  ]

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      pb-safe
      bg-[#1a1d2e]/95 light:bg-white/95
      backdrop-blur-xl
      border-t border-white/10 light:border-[#1a1d2e]/10
      shadow-2xl
    ">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7a9278] to-transparent opacity-50" />

      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around h-20 relative">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  tab.action()
                  setTimeout(() => setActiveTab(null), 200)
                }}
                className={`
                  relative flex flex-col items-center justify-center gap-1.5
                  min-w-[70px] h-16
                  tap-highlight-transparent
                  transition-all duration-300 ease-out
                  ${isActive ? 'scale-110' : 'scale-100'}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator background */}
                {isActive && (
                  <div className="
                    absolute inset-0
                    bg-gradient-to-t from-[#7a9278]/20 to-transparent
                    rounded-2xl
                    animate-in fade-in duration-200
                  " />
                )}

                {/* Icon container with glow effect */}
                <div className={`
                  relative
                  w-10 h-10
                  rounded-xl
                  flex items-center justify-center
                  transition-all duration-300 ease-out
                  ${isActive
                    ? 'bg-gradient-to-br from-[#7a9278] to-[#6a8268] shadow-lg shadow-[#7a9278]/30'
                    : 'bg-white/5 light:bg-[#1a1d2e]/5'
                  }
                `}>
                  <Icon
                    className={`
                      h-5 w-5
                      transition-all duration-300 ease-out
                      ${isActive
                        ? 'text-white scale-110'
                        : 'text-white/60 light:text-[#1a1d2e]/60'
                      }
                    `}
                    strokeWidth={2.5}
                  />

                  {/* Sparkle effect on active */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-3 w-3 text-[#7a9278] animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <span className={`
                  text-[11px] font-medium
                  transition-all duration-300 ease-out
                  ${isActive
                    ? 'text-[#7a9278] light:text-[#7a9278] scale-105'
                    : 'text-white/70 light:text-[#1a1d2e]/70'
                  }
                `}>
                  {tab.label}
                </span>

                {/* Bottom indicator line */}
                {isActive && (
                  <div className="
                    absolute -bottom-2 left-1/2 -translate-x-1/2
                    w-12 h-1
                    bg-gradient-to-r from-transparent via-[#7a9278] to-transparent
                    rounded-full
                    animate-in slide-in-from-bottom duration-200
                  " />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom safe area fill */}
      <div className="h-[env(safe-area-inset-bottom)] bg-[#1a1d2e]/95 light:bg-white/95 backdrop-blur-xl" />
    </nav>
  )
}
