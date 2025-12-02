"use client"

import { useState, useEffect } from "react"
import {
  Play,
  Pause,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  MapPin,
  Home,
  Utensils,
  Heart,
  Sun,
  X,
  Navigation,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data
const mockMetrics = {
  totalCount: 8247,
  monthlyChange: -3.2,
  hotspots: 23,
  coverageGap: 67,
}

const mockTrendData = [
  { month: "Jan", count: 8500 },
  { month: "Feb", count: 8300 },
  { month: "Mar", count: 8100 },
  { month: "Apr", count: 8400 },
  { month: "May", count: 8200 },
  { month: "Jun", count: 8000 },
  { month: "Jul", count: 8100 },
  { month: "Aug", count: 8300 },
  { month: "Sep", count: 8150 },
  { month: "Oct", count: 8050 },
  { month: "Nov", count: 8200 },
  { month: "Dec", count: 8247 },
]

const mockTopAreas = [
  { name: "Downtown Core", count: 1247, change: 5.2 },
  { name: "Balboa Park", count: 892, change: -2.1 },
  { name: "East Village", count: 743, change: 8.7 },
  { name: "Hillcrest", count: 621, change: -1.3 },
  { name: "Golden Hill", count: 534, change: 3.4 },
]

const mockRecommendations = [
  {
    id: 1,
    location: "Downtown Transit Center",
    type: "shelter",
    icon: Home,
    estimate: 150,
    accessibility: 95,
    color: "bg-blue-500",
  },
  {
    id: 2,
    location: "Balboa Park North",
    type: "food",
    icon: Utensils,
    estimate: 200,
    accessibility: 78,
    color: "bg-green-500",
  },
  {
    id: 3,
    location: "East Village Medical",
    type: "medical",
    icon: Heart,
    estimate: 85,
    accessibility: 92,
    color: "bg-red-500",
  },
  {
    id: 4,
    location: "Hillcrest Day Center",
    type: "day-center",
    icon: Sun,
    estimate: 120,
    accessibility: 85,
    color: "bg-yellow-500",
  },
]

const months = [
  "Jan 2023",
  "Feb 2023",
  "Mar 2023",
  "Apr 2023",
  "May 2023",
  "Jun 2023",
  "Jul 2023",
  "Aug 2023",
  "Sep 2023",
  "Oct 2023",
  "Nov 2023",
  "Dec 2023",
  "Jan 2024",
  "Feb 2024",
  "Mar 2024",
  "Apr 2024",
  "May 2024",
  "Jun 2024",
  "Jul 2024",
  "Aug 2024",
  "Sep 2024",
  "Oct 2024",
  "Nov 2024",
  "Dec 2024",
]

export default function HomelessDashboard() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(23) // Dec 2024
  const [speed, setSpeed] = useState(1)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // const [viewMode, setViewMode] = useState("Heatmap") // TODO: Implement view mode switching
  const [recommendations, setRecommendations] = useState(mockRecommendations)
  const [animatedMetrics, setAnimatedMetrics] = useState({
    totalCount: 0,
    monthlyChange: 0,
    hotspots: 0,
    coverageGap: 0,
  })

  // Animate metrics on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedMetrics(mockMetrics)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentMonth((prev) => (prev + 1) % months.length)
      }, 1000 / speed)
      return () => clearInterval(interval)
    }
  }, [isPlaying, speed])

  const dismissRecommendation = (id: number) => {
    setRecommendations((prev) => prev.filter((rec) => rec.id !== id))
  }

  const MetricCard = ({ title, value, change, icon: Icon, suffix = "" }: { 
    title: string; 
    value: number | string; 
    change?: number; 
    icon: React.ElementType; 
    suffix?: string 
  }) => (
    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white transition-all duration-1000">
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Icon className="h-6 w-6 text-gray-400 mb-2" />
            {change !== undefined && (
              <div className={`flex items-center text-sm ${change >= 0 ? "text-red-400" : "text-green-400"}`}>
                {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const MiniChart = () => (
    <div className="h-20 flex items-end space-x-1">
      {mockTrendData.map((data, index) => (
        <div
          key={index}
          className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t opacity-70 hover:opacity-100 transition-opacity"
          style={{ height: `${(data.count / Math.max(...mockTrendData.map((d) => d.count))) * 100}%` }}
        />
      ))}
    </div>
  )

  return (
    <div className="h-screen w-full bg-gray-900 relative overflow-hidden">
      {/* Main Map Container */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Center Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-gray-900/20 to-gray-900/60" />

        {/* Map Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-100">
            <MapPin className="h-20 w-20 mx-auto mb-6 opacity-70" />
            <p className="text-xl font-semibold mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              San Diego Heatmap Visualization
            </p>
            <p className="text-base" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              Interactive map data will render here
            </p>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-600">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-6">
            <h1 className="text-3xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              San Diego Homeless Dashboard
            </h1>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  {mockMetrics.totalCount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                  Total Count
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${mockMetrics.monthlyChange >= 0 ? 'text-red-400' : 'text-green-400'}`} 
                   style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  {mockMetrics.monthlyChange > 0 ? '+' : ''}{mockMetrics.monthlyChange}%
                </p>
                <p className="text-sm text-gray-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                  Monthly Change
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Sidebar */}
      <div
        className={`absolute top-16 left-0 bottom-24 z-40 transition-all duration-300 ${
          sidebarCollapsed ? "w-12" : "w-80"
        }`}
      >
        <div className="h-full bg-gray-900/80 backdrop-blur-md border-r border-gray-700 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-4 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white z-10"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          {!sidebarCollapsed && (
            <div className="space-y-6 animate-in slide-in-from-left duration-300">
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Key Metrics</h2>
                <div className="space-y-4">
                  <MetricCard
                    title="Total Homeless Count"
                    value={animatedMetrics.totalCount}
                    change={animatedMetrics.monthlyChange}
                    icon={MapPin}
                  />
                  <MetricCard
                    title="Month-over-Month"
                    value={animatedMetrics.monthlyChange}
                    icon={TrendingDown}
                    suffix="%"
                  />
                  <MetricCard title="Hotspot Areas" value={animatedMetrics.hotspots} icon={TrendingUp} />
                  <MetricCard
                    title="Coverage Gap Score"
                    value={animatedMetrics.coverageGap}
                    icon={Navigation}
                    suffix="/100"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  12-Month Trend
                </h3>
                <Card className="bg-black/90 border-gray-600 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <MiniChart />
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  Top 5 Areas
                </h3>
                <div className="space-y-2">
                  {mockTopAreas.map((area, index) => (
                    <Card key={index} className="bg-black/90 border-gray-600 backdrop-blur-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                              {area.name}
                            </p>
                            <p className="text-gray-200 text-xs font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                              {area.count} people
                            </p>
                          </div>
                          <div
                            className={`flex items-center text-xs font-bold ${
                              area.change >= 0 ? "text-red-400" : "text-green-400"
                            }`}
                            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                          >
                            {area.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(area.change)}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="absolute top-20 right-6 z-40 space-y-3 max-w-sm">
        {recommendations.map((rec, index) => {
          const IconComponent = rec.icon
          return (
            <Card
              key={rec.id}
              className="bg-gray-900/90 backdrop-blur-md border-gray-700 hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in slide-in-from-right"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${rec.color}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{rec.location}</h4>
                      <p className="text-gray-400 text-xs capitalize">{rec.type.replace("-", " ")}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dismissRecommendation(rec.id)}
                    className="h-6 w-6 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Est. People Helped:</span>
                    <span className="text-white font-medium">{rec.estimate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Transit Access:</span>
                    <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                      {rec.accessibility}%
                    </Badge>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Deploy Here</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Time Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-t border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-6">
            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-gray-700"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            {/* Timeline Slider */}
            <div className="flex-1 space-y-2">
              <Slider
                value={[currentMonth]}
                onValueChange={(value) => setCurrentMonth(value[0])}
                max={months.length - 1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Jan 2023</span>
                <span>Dec 2024</span>
              </div>
            </div>

            {/* Current Month Display */}
            <div className="text-center min-w-[120px]">
              <p className="text-2xl font-bold text-white">{months[currentMonth]}</p>
              <p className="text-sm text-gray-400">Current Period</p>
            </div>

            {/* Speed Control */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Speed:</span>
              <div className="flex bg-gray-800 rounded-lg p-1">
                {[1, 2, 3].map((speedOption) => (
                  <button
                    key={speedOption}
                    onClick={() => setSpeed(speedOption)}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      speed === speedOption
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    {speedOption}x
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${((currentMonth + 1) / months.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
