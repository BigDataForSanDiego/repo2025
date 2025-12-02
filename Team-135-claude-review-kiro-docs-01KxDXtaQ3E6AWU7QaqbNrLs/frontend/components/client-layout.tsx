'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Navigation } from '@/components/navigation'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="relative flex flex-col min-h-[100dvh] overflow-x-hidden">
        {/* Main content area - with padding for fixed nav */}
        <div className="flex-1 pb-24">
          {children}
        </div>

        {/* Fixed navigation */}
        <Navigation />
      </div>
    </ThemeProvider>
  )
}
