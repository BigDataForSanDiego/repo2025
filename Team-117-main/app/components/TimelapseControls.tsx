'use client';

import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface TimelapseControlsProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function TimelapseControls({ selectedMonth, onMonthChange }: TimelapseControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  // Generate available months (2023 to July 2025)
  const months = useMemo(() => {
    const monthsArray: string[] = [];
    for (let year = 2023; year <= 2025; year++) {
      const maxMonth = year === 2025 ? 7 : 12; // Stop at July 2025
      for (let month = 1; month <= maxMonth; month++) {
        monthsArray.push(`${year}-${String(month).padStart(2, '0')}`);
      }
    }
    return monthsArray;
  }, []);

  const currentIndex = months.indexOf(selectedMonth);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % months.length;
        onMonthChange(months[nextIndex]);
      }, 2000 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, currentIndex, months, onMonthChange]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onMonthChange(months[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < months.length - 1) {
      onMonthChange(months[currentIndex + 1]);
    }
  };

  const handleSliderChange = (value: number[]) => {
    onMonthChange(months[value[0]]);
  };

  // Helper function to format month display
  const formatMonthYear = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(monthNum) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg w-full">
      <div className="flex flex-col space-y-4">
        {/* Date and Status Display */}
        <div className="flex items-center">
          <div className="flex-1"></div>
          
          <div className="text-2xl font-bold text-white text-center flex-1">
            {formatMonthYear(selectedMonth)}
          </div>
          
          {/* Playback Status Indicator */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isPlaying 
                ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' 
                : 'bg-gray-500'
            }`} />
            <span className="text-gray-300 text-sm">
              {isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Interactive Gradient Timeline */}
        <div className="space-y-2">
          <div className="relative">
            <Slider
              value={[currentIndex]}
              onValueChange={handleSliderChange}
              max={months.length - 1}
              step={1}
              className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-blue-400 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:rounded-full [&_[role=slider]]:shadow-none [&_[role=slider]]:ring-0 [&_[role=slider]]:outline-none [&>span:first-child]:h-3 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-blue-500 [&>span:first-child]:to-cyan-400 [&>span:first-child]:rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Jan 2023</span>
            <span>Jul 2025</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="text-white hover:bg-gray-800 disabled:opacity-50 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Play/Pause with smooth rotation */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-gray-800 transition-all duration-200 group"
            >
              <div className={`transition-transform duration-300 ${isPlaying ? 'rotate-90' : 'rotate-0'}`}>
                {isPlaying ? (
                  <Pause className="h-5 w-5 transition-all duration-200" />
                ) : (
                  <Play className="h-5 w-5 transition-all duration-200" />
                )}
              </div>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === months.length - 1}
              className="text-white hover:bg-gray-800 disabled:opacity-50 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Enhanced Speed Controls */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-300 text-sm">Speed:</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((speedOption) => (
                <button
                  key={speedOption}
                  onClick={() => setSpeed(speedOption)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    speed === speedOption
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {speedOption}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}