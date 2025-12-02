'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TouchInputBoxProps {
  onSubmit: (input: string) => void;
}

const DEMO_SUGGESTIONS = [
  "I need food and somewhere to sleep tonight",
  "I'm looking for medical help and mental health support", 
  "I need a safe place to stay and help finding work",
  "I'm hungry and need hygiene facilities",
  "I need crisis support and emergency shelter"
];

export default function TouchInputBox({ onSubmit }: TouchInputBoxProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setInput(text);
    
    // Add realistic delay for demo effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit(text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    handleSubmit(suggestion);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      
      {/* Main Input Area */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Describe what help is needed..."
            className="w-full min-h-[120px] lg:min-h-[140px] p-6 lg:p-8 
                     text-lg lg:text-xl text-white placeholder-gray-400
                     bg-slate-800 border border-slate-600
                     rounded-2xl lg:rounded-3xl resize-none
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                     transition-all duration-300
                     font-medium leading-relaxed"
            disabled={isSubmitting}
          />
          
          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || isSubmitting}
            className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6
                     px-6 py-3 lg:px-8 lg:py-4 
                     bg-teal-600 hover:bg-teal-700
                     disabled:bg-gray-600 
                     disabled:cursor-not-allowed
                     text-white font-semibold text-base lg:text-lg
                     rounded-xl lg:rounded-2xl shadow-lg
                     transition-all duration-200
                     min-w-[100px] lg:min-w-[120px]
                     touch-manipulation"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : (
              'Find Help'
            )}
          </motion.button>
        </motion.div>

        {/* Processing Animation */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center space-x-3 px-6 py-3 
                           bg-slate-700 border border-slate-600
                           rounded-xl text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full"
                />
                <span className="text-lg font-medium">AI is analyzing the request...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && !isSubmitting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className="text-center mb-4">
              <span className="text-gray-300 text-base lg:text-lg font-medium">
                Try these common requests:
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              {DEMO_SUGGESTIONS.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-4 lg:p-5 text-left text-gray-200
                           bg-slate-700 hover:bg-slate-600 
                           border border-slate-600 hover:border-slate-500
                           rounded-xl lg:rounded-2xl transition-all duration-200
                           text-sm lg:text-base leading-relaxed
                           touch-manipulation"
                >
                  &ldquo;{suggestion}&rdquo;
                </motion.button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-400 hover:text-gray-200 text-sm lg:text-base 
                         transition-colors duration-200 underline underline-offset-4"
              >
                Hide suggestions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}