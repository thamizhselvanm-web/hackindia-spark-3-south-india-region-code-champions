import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BrainCircuit, BarChart, Target, CheckCircle } from 'lucide-react';

const steps = [
  { id: 1, text: "Scanning company website", icon: Search },
  { id: 2, text: "Understanding business model", icon: BrainCircuit },
  { id: 3, text: "Analyzing target audience", icon: BarChart },
  { id: 4, text: "Generating campaign strategy", icon: Target }
];

const AIThinking = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Progress automatically every 1.5 seconds for demo/animation purposes
    // (In reality this could be synced via server-side events, but this simulates it smoothly)
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length) {
          clearInterval(interval);
          setTimeout(() => {
            if(onComplete) onComplete();
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel p-8 max-w-md w-full"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            <BrainCircuit className="w-12 h-12 text-primary-main" />
          </motion.div>
        </div>
        
        <h3 className="text-xl font-bold text-center mb-6 text-white text-gradient">AI is analyzing...</h3>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isActive || isCompleted ? 1 : 0.4, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-accent/20 text-accent' : 
                    isActive ? 'bg-primary-main/20 text-primary-main animate-pulse' : 
                    'bg-surface text-muted'}
                `}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {step.text}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-1 w-full bg-surface rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(currentStep, steps.length) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AIThinking;
