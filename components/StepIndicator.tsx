
import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const STEPS = [
  { id: 'input', label: '1. Input Data', short: 'Input' },
  { id: 'validateBlueprint', label: '2. Validasi DNA', short: 'DNA' },
  { id: 'dashboard', label: '3. Galeri Konsep', short: 'Galeri' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  // Landing page doesn't show stepper
  if (currentStep === 'landing') return null;

  const getCurrentIndex = () => {
    return STEPS.findIndex(s => s.id === currentStep);
  };

  const currentIndex = getCurrentIndex();

  return (
    <div className="w-full bg-gray-900/50 backdrop-blur-md border-b border-gray-800 py-3 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 rounded-full -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-primary rounded-full -z-10 transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          ></div>

          {STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div key={step.id} className="flex flex-col items-center group cursor-default">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 relative z-10
                    ${isActive ? 'bg-brand-primary border-brand-primary text-white scale-110 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 
                      isCompleted ? 'bg-brand-surface border-brand-primary text-brand-primary' : 'bg-gray-800 border-gray-600 text-gray-500'}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={`mt-2 text-xs font-medium transition-colors duration-300 absolute top-8 w-32 text-center
                    ${isActive ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-600'}
                  `}
                >
                  <span className="hidden md:inline">{step.label}</span>
                  <span className="md:hidden">{step.short}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
