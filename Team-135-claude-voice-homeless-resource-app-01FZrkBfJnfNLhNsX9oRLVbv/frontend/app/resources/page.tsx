'use client'

import { ArrowLeft, HomeIcon, Utensils, Droplets, Cross, PawPrint, MapPin, Clock, Phone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const resourceCategories = [
  {
    icon: HomeIcon,
    title: 'Shelter',
    description: 'Emergency housing & overnight stays',
    href: '/resources/shelter',
    gradient: 'from-blue-500/20 to-blue-600/20',
    iconColor: 'text-blue-400',
    hoverGradient: 'hover:from-blue-500/30 hover:to-blue-600/30',
  },
  {
    icon: Utensils,
    title: 'Food',
    description: 'Meals, pantries & nutrition support',
    href: '/resources/food',
    gradient: 'from-orange-500/20 to-orange-600/20',
    iconColor: 'text-orange-400',
    hoverGradient: 'hover:from-orange-500/30 hover:to-orange-600/30',
  },
  {
    icon: Droplets,
    title: 'Hygiene',
    description: 'Showers, restrooms & personal care',
    href: '/resources/hygiene',
    gradient: 'from-cyan-500/20 to-cyan-600/20',
    iconColor: 'text-cyan-400',
    hoverGradient: 'hover:from-cyan-500/30 hover:to-cyan-600/30',
  },
  {
    icon: Cross,
    title: 'Medical',
    description: 'Healthcare, clinics & emergency care',
    href: '/resources/medical',
    gradient: 'from-red-500/20 to-red-600/20',
    iconColor: 'text-red-400',
    hoverGradient: 'hover:from-red-500/30 hover:to-red-600/30',
  },
  {
    icon: PawPrint,
    title: 'Pet-friendly',
    description: 'Services that welcome your pets',
    href: '/resources/pets',
    fullWidth: true,
    gradient: 'from-purple-500/20 to-purple-600/20',
    iconColor: 'text-purple-400',
    hoverGradient: 'hover:from-purple-500/30 hover:to-purple-600/30',
  },
]

export default function ResourcesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1a1d2e] via-[#1e2235] to-[#1a1d2e]">
      {/* Enhanced Header with gradient border */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a9278]/20 via-transparent to-[#7a9278]/20" />
        <div className="relative flex items-center gap-4 p-4 border-b border-white/10 backdrop-blur-sm">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
              aria-label="Go back to home"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Find Resources</h1>
            <p className="text-xs text-white/60">Available 24/7 in San Diego</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6 pb-8">
          {/* Welcome Section with better visual hierarchy */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-[#7a9278]/50 to-transparent rounded-full" />
            </div>

            <div className="text-center space-y-2 py-2">
              <h2 className="text-2xl font-bold text-white">What do you need today?</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Tap any category to find nearby resources
              </p>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#7a9278] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/60 truncate">Showing</p>
                  <p className="text-sm font-semibold text-white truncate">Nearby</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#7a9278] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/60 truncate">Available</p>
                  <p className="text-sm font-semibold text-white truncate">24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Resource Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {resourceCategories.map((category, index) => (
              <Link
                key={category.title}
                href={category.href}
                className={`group ${category.fullWidth ? 'col-span-2' : ''}`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className={`
                  relative h-40 rounded-2xl overflow-hidden
                  bg-gradient-to-br ${category.gradient}
                  border border-white/10
                  backdrop-blur-sm
                  transition-all duration-300
                  ${category.hoverGradient}
                  group-hover:scale-[1.02] group-hover:shadow-2xl
                  group-hover:border-white/20
                  group-focus:ring-2 group-focus:ring-[#7a9278] group-focus:ring-offset-2 group-focus:ring-offset-[#1a1d2e]
                `}>
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d2e]/50 to-transparent" />

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-6 gap-3 text-center">
                    {/* Icon with animated background */}
                    <div className="relative">
                      <div className={`
                        absolute inset-0 ${category.iconColor} opacity-20 blur-xl rounded-full
                        group-hover:opacity-40 transition-opacity duration-300
                      `} />
                      <category.icon className={`
                        relative h-10 w-10 ${category.iconColor}
                        group-hover:scale-110 transition-transform duration-300
                        drop-shadow-lg
                      `} />
                    </div>

                    {/* Text */}
                    <div className="space-y-1">
                      <div className="font-bold text-white text-lg tracking-tight">
                        {category.title}
                      </div>
                      <div className="text-xs text-white/80 leading-snug">
                        {category.description}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className={`
                      absolute bottom-3 right-3 opacity-0
                      group-hover:opacity-100 transition-opacity duration-300
                    `}>
                      <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                        <ArrowLeft className="h-3 w-3 text-white rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Emergency Contact Card */}
          <div className="mt-8 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold mb-1">Emergency?</h3>
                <p className="text-white/70 text-sm mb-3">
                  If you need immediate help, call 211 for community resources or 911 for emergencies
                </p>
                <a
                  href="tel:211"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-white rounded-xl font-semibold text-sm transition-colors duration-300"
                >
                  <Phone className="h-4 w-4" />
                  Call 211
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Bottom Navigation */}
      <nav className="border-t border-white/10 bg-[#1a1d2e]/95 backdrop-blur-md">
        <div className="flex items-center justify-around h-20 max-w-md mx-auto px-4">
          <Link href="/">
            <button
              className="flex flex-col items-center gap-1 text-white/60 hover:text-white/80 transition-colors duration-300 group"
              aria-label="Go to home"
            >
              <HomeIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs font-medium">Home</span>
            </button>
          </Link>
          <button
            className="flex flex-col items-center gap-1 text-white relative"
            aria-label="Resources page (current)"
          >
            <div className="h-6 w-6 rounded-lg bg-[#7a9278]/30 border border-[#7a9278]/50 flex items-center justify-center">
              <div className="h-3 w-3 grid grid-cols-2 gap-0.5">
                <div className="bg-[#7a9278] rounded-sm" />
                <div className="bg-[#7a9278] rounded-sm" />
                <div className="bg-[#7a9278] rounded-sm" />
                <div className="bg-[#7a9278] rounded-sm" />
              </div>
            </div>
            <span className="text-xs font-semibold">Resources</span>
            <div className="absolute -top-1 h-1 w-8 bg-[#7a9278] rounded-full" />
          </button>
          <Link href="/map">
            <button
              className="flex flex-col items-center gap-1 text-white/60 hover:text-white/80 transition-colors duration-300 group"
              aria-label="Go to map"
            >
              <MapPin className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs font-medium">Map</span>
            </button>
          </Link>
          <button
            className="flex flex-col items-center gap-1 text-white/60 hover:text-white/80 transition-colors duration-300 group"
            aria-label="Go to profile"
          >
            <div className="h-6 w-6 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
