'use client';

import { useState, useEffect } from 'react';
import { Home, Utensils, Heart, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceRecommendation {
  id: string;
  lat: number;
  lng: number;
  type: 'shelter' | 'food_bank' | 'medical' | 'day_center';
  score: number;
  peopleHelped: number;
}

interface RecommendationCardsProps {
  recommendations: ServiceRecommendation[];
  onCardClick: (recommendation: ServiceRecommendation) => void;
}

const serviceIcons = {
  shelter: Home,
  food_bank: Utensils,
  medical: Heart,
  day_center: Sun,
};

const serviceColors = {
  shelter: 'bg-blue-500',
  food_bank: 'bg-green-500',
  medical: 'bg-red-500',
  day_center: 'bg-yellow-500',
};

export default function RecommendationCards({ recommendations, onCardClick }: RecommendationCardsProps) {
  const [visibleRecommendations, setVisibleRecommendations] = useState(recommendations);

  useEffect(() => {
    setVisibleRecommendations(recommendations);
  }, [recommendations]);

  const dismissRecommendation = (id: string) => {
    setVisibleRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  return (
    <div className="absolute top-20 right-6 z-40 space-y-3 max-w-sm">
      {visibleRecommendations.map((rec, index) => {
        const IconComponent = serviceIcons[rec.type];
        return (
          <Card
            key={rec.id}
            className="bg-black/95 backdrop-blur-md border-gray-600 hover:bg-gray-800/95 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-in slide-in-from-right cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onCardClick(rec)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${serviceColors[rec.type]}`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-base" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                      {rec.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Service
                    </h4>
                    <p className="text-gray-200 text-sm font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                      {rec.lat.toFixed(4)}, {rec.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissRecommendation(rec.id);
                  }}
                  className="h-6 w-6 text-gray-300 hover:text-white hover:bg-gray-700/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200 text-sm font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                    Impact Score
                  </span>
                  <span className="text-white font-bold text-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    {Math.round(rec.score)}/100
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-200 text-sm font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                    Est. People Helped
                  </span>
                  <span className="text-white font-bold text-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    {rec.peopleHelped}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}