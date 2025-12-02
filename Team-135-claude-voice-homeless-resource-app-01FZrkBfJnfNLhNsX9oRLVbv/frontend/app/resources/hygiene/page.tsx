import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HygienePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#1a1d2e]">
      <header className="flex items-center gap-4 p-4 border-b border-[#2a2d3e]">
        <Link href="/resources">
          <Button variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-white">Hygiene Resources</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <p className="text-white/80 text-center">
            Finding nearby hygiene resources...
          </p>
        </div>
      </main>
    </div>
  )
}
