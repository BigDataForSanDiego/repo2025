'use client';

import { useState } from 'react';
import TouchInputBox from './components/TouchInputBox';
import ServiceCardGrid from './components/ServiceCardGrid';
import DemoMap from './components/DemoMap';
import PrintPreviewModal from './components/PrintPreviewModal';
import { ProcessedService } from './types';

export default function FieldAssistPage() {
  const [currentStep, setCurrentStep] = useState<'input' | 'results' | 'directions'>('input');
  const [userInput, setUserInput] = useState('');
  const [identifiedNeeds] = useState<string[]>([]);
  const [matchedServices, setMatchedServices] = useState<ProcessedService[]>([]);
  const [selectedService, setSelectedService] = useState<ProcessedService | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const handleInputSubmit = (input: string) => {
    setUserInput(input);
    setCurrentStep('results');
    // This will trigger the mock AI processing
  };

  const handleServiceSelect = (service: ProcessedService) => {
    setSelectedService(service);
    setCurrentStep('directions');
  };

  const handleGenerateDirections = () => {
    setShowPrintPreview(true);
  };

  const handleServicesUpdate = (services: ProcessedService[]) => {
    setMatchedServices(services);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-900 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-slate-800" />
      
      {/* Header - Fixed at top */}
      <div className="relative z-10 text-center p-4 lg:p-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
          Field Assist
        </h1>
        <p className="text-lg lg:text-xl text-gray-300">
          AI-powered service matching for case workers in the field
        </p>
      </div>

      {/* Main Content Container - Fixed height structure */}
      <div className="relative z-10 p-4 lg:p-6 pt-0" style={{ height: 'calc(100vh - 120px)' }}>
        
        {/* Input Section */}
        {currentStep === 'input' && (
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-semibold text-white mb-4">
                How can we help you today?
              </h2>
              <p className="text-gray-300 text-lg">
                Describe what the person needs, and we&apos;ll find the closest services
              </p>
            </div>
            <TouchInputBox onSubmit={handleInputSubmit} />
          </div>
        )}

        {/* Results Layout - Responsive with proper heights */}
        {currentStep !== 'input' && (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            
            {/* Left Side - Map (Responsive height) */}
            <div className="lg:flex-1">
              <div 
                className="w-full rounded-xl lg:rounded-2xl overflow-hidden bg-slate-800 border border-slate-700"
                style={{ 
                  height: 'calc(50vh - 90px)', // Half viewport on all sizes
                  maxHeight: 'calc(50vh - 90px)',
                  minHeight: '250px'
                }}
              >
                <DemoMap 
                  services={matchedServices}
                  selectedService={selectedService}
                  onServiceSelect={handleServiceSelect}
                />
              </div>
            </div>

            {/* Right Side - Service Results (Responsive, scrollable) */}
            <div 
              className="flex-1 lg:w-[440px] lg:flex-shrink-0"
              style={{ 
                height: 'calc(50vh - 90px)', // Match map height on mobile/tablet
                maxHeight: 'calc(50vh - 90px)',
              }}
            >
              <ServiceCardGrid
                userInput={userInput}
                identifiedNeeds={identifiedNeeds}
                services={matchedServices}
                selectedService={selectedService}
                onServiceSelect={handleServiceSelect}
                onGenerateDirections={handleGenerateDirections}
                onServicesUpdate={handleServicesUpdate}
                currentStep={currentStep}
              />
            </div>

          </div>
        )}

      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && selectedService && (
        <PrintPreviewModal
          service={selectedService}
          userInput={userInput}
          onClose={() => setShowPrintPreview(false)}
        />
      )}

    </main>
  );
}