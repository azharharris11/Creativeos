
import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { InputForm } from './components/InputForm';
import { MatrixBuilder } from './components/MatrixBuilder';
import { RealitySimulator } from './components/RealitySimulator';
import { StepIndicator } from './components/StepIndicator';
import { AppStep, MatrixSlot, Hypothesis } from './types';
import { generateHypothesisImage, roastHypothesis } from './services/geminiService';

function simpleUUID() {
    return Math.random().toString(36).substring(2, 15);
}

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [productContext, setProductContext] = useState('');
  const [goldenHook, setGoldenHook] = useState('');
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);

  // Step 1: Lock the Anchor
  const handleAnchorConfirmed = (product: string, hook: string) => {
      setProductContext(product);
      setGoldenHook(hook);
      setTimeout(() => setCurrentStep('matrix'), 1500); // Slight delay for effect
  };

  // Step 2: Execute Matrix
  const handleMatrixExecution = async (slots: Record<'A' | 'B' | 'C', MatrixSlot>) => {
      setCurrentStep('reality');
      
      // Initialize Hypotheses Placeholders
      const initialHypotheses: Hypothesis[] = (['A', 'B', 'C'] as const).map(id => ({
          id: simpleUUID(),
          slotId: id,
          matrixConfig: slots[id],
          hook: goldenHook,
          visualPrompt: '',
          isGenerating: true
      }));
      
      setHypotheses(initialHypotheses);

      // Generate in parallel
      initialHypotheses.forEach(h => generateImageForHypothesis(h));
  };

  const generateImageForHypothesis = async (h: Hypothesis) => {
      try {
          // Update state to generating
          setHypotheses(prev => prev.map(item => item.id === h.id ? { ...item, isGenerating: true, error: undefined } : item));
          
          const imageUrl = await generateHypothesisImage(h.matrixConfig, productContext, goldenHook);
          
          setHypotheses(prev => prev.map(item => item.id === h.id ? { ...item, imageUrl, isGenerating: false } : item));
      } catch (e: any) {
          console.error("Generation error", e);
          setHypotheses(prev => prev.map(item => item.id === h.id ? { ...item, isGenerating: false, error: e.message } : item));
      }
  };

  const handleRoast = async (id: string) => {
      const hypothesis = hypotheses.find(h => h.id === id);
      if(!hypothesis || !hypothesis.imageUrl) return;

      try {
        // Optimistic update or loading state for roast could go here
        const roastData = await roastHypothesis(hypothesis.imageUrl.split(',')[1], goldenHook);
        setHypotheses(prev => prev.map(item => item.id === id ? { ...item, aiRoast: roastData } : item));
      } catch (e) {
          console.error("Roast failed", e);
      }
  };

  const renderContent = () => {
      switch(currentStep) {
          case 'landing': return <LandingPage onStart={() => setCurrentStep('anchor')} />;
          case 'anchor': return <InputForm onConfirmAnchor={handleAnchorConfirmed} />;
          case 'matrix': return <MatrixBuilder onGenerate={handleMatrixExecution} />;
          case 'reality': return <RealitySimulator hypotheses={hypotheses} onRegenerate={(id) => { 
              const h = hypotheses.find(i => i.id === id);
              if(h) generateImageForHypothesis(h);
          }} onRoast={handleRoast} />;
          default: return null;
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-black">
        {/* Background Grid Effect */}
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
            {currentStep !== 'landing' && (
                <nav className="border-b border-gray-800 bg-slate-900/50 backdrop-blur-md p-4 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="font-black text-xl tracking-tighter text-white">
                            CREATIVE<span className="text-cyan-500">OS</span> <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400 ml-2">v2.0 ENTITY BREAKER</span>
                        </div>
                        <div className="flex gap-2 text-xs font-mono">
                            <span className={currentStep === 'anchor' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>01 ANCHOR</span>
                            <span className="text-gray-700">/</span>
                            <span className={currentStep === 'matrix' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>02 MATRIX</span>
                            <span className="text-gray-700">/</span>
                            <span className={currentStep === 'reality' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>03 REALITY</span>
                        </div>
                    </div>
                </nav>
            )}

            <main className="flex-grow">
                {renderContent()}
            </main>
        </div>
    </div>
  );
}

export default App;
