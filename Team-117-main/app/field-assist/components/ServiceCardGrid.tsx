'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessedService } from '../types';
import { analyzeDemoInput, filterServicesByCategories } from '../utils/demoData';
import { AIResponse } from '../types';

interface ServiceCardGridProps {
  userInput: string;
  identifiedNeeds: string[];
  services: ProcessedService[];
  selectedService: ProcessedService | null;
  onServiceSelect: (service: ProcessedService) => void;
  onGenerateDirections: () => void;
  onServicesUpdate: (services: ProcessedService[]) => void;
  currentStep: 'input' | 'results' | 'directions';
}

const CATEGORY_ICONS: { [key: string]: string } = {
  'shelter': '🏠',
  'food': '🍽️',
  'health': '🏥',
  'hygiene': '🚿',
  'mental-health': '🧠',
  'substance-abuse': '💊',
  'employment': '💼',
  'legal': '⚖️',
  'crisis': '🆘',
  'other': '📍'
};

const CATEGORY_COLORS: { [key: string]: string } = {
  'shelter': 'border-blue-400 text-blue-400',
  'food': 'border-green-400 text-green-400', 
  'health': 'border-red-400 text-red-400',
  'hygiene': 'border-cyan-400 text-cyan-400',
  'mental-health': 'border-purple-400 text-purple-400',
  'substance-abuse': 'border-orange-400 text-orange-400',
  'employment': 'border-yellow-400 text-yellow-400',
  'legal': 'border-indigo-400 text-indigo-400',
  'crisis': 'border-pink-400 text-pink-400',
  'other': 'border-gray-400 text-gray-400'
};

export default function ServiceCardGrid({
  userInput,
  selectedService,
  onServiceSelect,
  onGenerateDirections,
  onServicesUpdate,
  currentStep
}: ServiceCardGridProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [filteredServices, setFilteredServices] = useState<ProcessedService[]>([]);
  const processedInputRef = useRef<string>('');

  useEffect(() => {
    if (userInput && currentStep === 'results' && processedInputRef.current !== userInput) {
      processedInputRef.current = userInput;
      
      const processUserInput = async () => {
        setIsProcessing(true);
        
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = analyzeDemoInput(userInput);
        const matchedServices = filterServicesByCategories(response.categories);
        
        setAiResponse(response);
        setFilteredServices(matchedServices);
        onServicesUpdate(matchedServices); // Pass services to parent
        setIsProcessing(false);
      };
      
      processUserInput();
    }
  }, [userInput, currentStep, onServicesUpdate]);

  if (currentStep === 'input') {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-slate-800 border border-slate-700 rounded-2xl p-6">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {currentStep === 'results' ? 'Available Services' : 'Service Details'}
        </h2>
        {currentStep === 'results' && (
          <p className="text-gray-400 text-sm">
            Based on: &quot;{userInput}&quot;
          </p>
        )}
      </div>

      {/* AI Processing Animation */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-white text-lg mb-2">Analyzing your request...</p>
            <p className="text-gray-300 text-sm text-center max-w-xs">
              Finding the closest services that match your needs
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response Summary */}
      <AnimatePresence>
        {aiResponse && !isProcessing && currentStep === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-xl"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-200 text-sm leading-relaxed mb-3">
                  {aiResponse.explanation}
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiResponse.categories.map((category: string) => (
                    <span
                      key={category}
                      className={`px-3 py-1 border ${CATEGORY_COLORS[category]} bg-transparent text-xs rounded-full font-medium flex items-center space-x-1`}
                    >
                      <span>{CATEGORY_ICONS[category]}</span>
                      <span className="capitalize">{category.replace('-', ' ')}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        
        {/* Service Results */}
        <AnimatePresence>
          {filteredServices.length > 0 && !isProcessing && currentStep === 'results' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 pb-4"
            >
              {filteredServices.map((service, index) => (
                <motion.button
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onServiceSelect(service)}
                  className="w-full p-4 text-left bg-slate-700 hover:bg-slate-600 
                           border border-slate-600 hover:border-slate-500 
                           rounded-xl transition-all duration-200 touch-manipulation"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{service.name}</h3>
                      <p className="text-gray-300 text-sm">{service.organization}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-teal-400 font-semibold text-sm">{service.distance}</div>
                      <div className="text-gray-300 text-xs">🚶 {service.walkTime}</div>
                      {service.transitTime && (
                        <div className="text-gray-300 text-xs">🚌 {service.transitTime.time}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {service.categories.map((category) => (
                      <span
                        key={category}
                        className={`px-2 py-1 border ${CATEGORY_COLORS[category]} bg-transparent text-xs rounded-full font-medium flex items-center space-x-1`}
                      >
                        <span>{CATEGORY_ICONS[category]}</span>
                        <span className="capitalize">{category.replace('-', ' ')}</span>
                      </span>
                    ))}
                  </div>

                  <div className="text-gray-300 text-sm mb-2">
                    <p className="truncate">{service.address}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-xs font-medium">{service.status === 'open' ? 'Open Now' : 'Closed'}</span>
                    </div>
                    {service.phone && (
                      <span className="text-gray-400 text-xs">{service.phone}</span>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Service Detail View */}
        <AnimatePresence>
          {selectedService && currentStep === 'directions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-6"
            >
              {/* Service Header */}
              <div className="text-center pb-4 border-b border-slate-600">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedService.name}</h3>
                <p className="text-gray-300 mb-4">{selectedService.organization}</p>
                
                <div className="flex justify-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-teal-400 font-semibold text-lg">{selectedService.distance}</div>
                    <div className="text-gray-300">Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">🚶 {selectedService.walkTime}</div>
                    <div className="text-gray-300">Walking</div>
                  </div>
                  {selectedService.transitTime && (
                    <div className="text-center">
                      <div className="text-white font-semibold text-lg">🚌 {selectedService.transitTime.time}</div>
                      <div className="text-gray-300">Transit</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">📍 Address</h4>
                  <p className="text-gray-300 text-sm">{selectedService.address}</p>
                </div>

                {selectedService.phone && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">📞 Phone</h4>
                    <p className="text-gray-300 text-sm">{selectedService.phone}</p>
                  </div>
                )}

                {selectedService.hours && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">🕒 Hours</h4>
                    <p className="text-gray-300 text-sm">{selectedService.hours}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-white font-semibold mb-2">ℹ️ Description</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedService.description}</p>
                </div>

                {selectedService.eligibility && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">✅ Eligibility</h4>
                    <p className="text-gray-300 text-sm">{selectedService.eligibility}</p>
                  </div>
                )}

                {selectedService.capacity && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">🏢 Capacity</h4>
                    <p className="text-gray-300 text-sm">{selectedService.capacity}</p>
                  </div>
                )}

                {selectedService.transitTime && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">🚌 Transit Options</h4>
                    <p className="text-gray-300 text-sm">{selectedService.transitTime.details}</p>
                    {selectedService.transitTime.via && (
                      <p className="text-teal-400 text-xs mt-1">via {selectedService.transitTime.via}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Generate Directions Button */}
              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onGenerateDirections}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700
                           text-white font-semibold text-lg rounded-xl
                           transition-all duration-200 touch-manipulation"
                >
                  🗺️ Get Directions & Print
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}