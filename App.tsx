
import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { InputForm } from './components/InputForm';
import { MatrixBuilder } from './components/MatrixBuilder';
import { RealitySimulator } from './components/RealitySimulator';
import { MindMapCanvas } from './components/MindMapCanvas'; // New Import
import { AppStep, MatrixSlot, Hypothesis, ViewMode } from './types'; // Updated Type Import
import { generateHypothesisImage, roastHypothesis } from './services/geminiService';
import { NetworkIcon, LayoutGridIcon } from './components/icons';

function simpleUUID() {
    return Math.random().toString(36).substring(2, 15);
}

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [viewMode, setViewMode] = useState<ViewMode>('linear'); // 'linear' or 'canvas'
  
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
        const roastData = await roastHypothesis(hypothesis.imageUrl.split(',')[1], goldenHook);
        setHypotheses(prev => prev.map(item => item.id === id ? { ...item, aiRoast: roastData } : item));
      } catch (e) {
          console.error("Roast failed", e);
      }
  };
  
  // Canvas Actions
  const handleDuplicateHypothesis = (h: Hypothesis) => {
      const newId = simpleUUID();
      const newHypothesis: Hypothesis = {
          ...h,
          id: newId,
          slotId: h.slotId + '_copy',
          imageUrl: undefined, // Clear image to force regeneration if desired, or keep it
          isGenerating: false,
          aiRoast: undefined
      };
      setHypotheses(prev => [...prev, newHypothesis]);
  };

  const handleDeleteHypothesis = (id: string) => {
      setHypotheses(prev => prev.filter(h => h.id !== id));
  };

  const renderContent = () => {
      // If in God Mode (Canvas), override normal flow (except landing)
      if (viewMode === 'canvas' && currentStep !== 'landing') {
          return (
            <MindMapCanvas 
                hypotheses={hypotheses}
                productContext={productContext}
                goldenHook={goldenHook}
                onRegenerate={(id) => { const h = hypotheses.find(i => i.id === id); if(h) generateImageForHypothesis(h); }}
                onRoast={handleRoast}
                onDuplicate={handleDuplicateHypothesis}
                onDelete={handleDeleteHypothesis}
            />
          );
      }

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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
        {/* Background Grid Effect */}
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 flex flex-col min-h-screen h-screen">
            {currentStep !== 'landing' && (
                <nav className="border-b border-gray-800 bg-slate-900/80 backdrop-blur-md p-4 sticky top-0 z-50 flex-shrink-0">
                    <div className="max-w-full mx-auto flex justify-between items-center px-4">
                        <div className="font-black text-xl tracking-tighter text-white flex items-center gap-2">
                            CREATIVE<span className="text-cyan-500">OS</span> 
                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400 hidden sm:inline-block">v2.0 HYPOTHESIS ENGINE</span>
                        </div>
                        
                        {/* View Switcher */}
                        {hypotheses.length > 0 && (
                            <div className="flex bg-gray-800 rounded-lg p-1">
                                <button 
                                    onClick={() => setViewMode('linear')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'linear' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <LayoutGridIcon className="w-4 h-4" /> Focus Mode
                                </button>
                                <button 
                                    onClick={() => setViewMode('canvas')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'canvas' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <NetworkIcon className="w-4 h-4" /> God Mode (Canvas)
                                </button>
                            </div>
                        )}

                        <div className="hidden md:flex gap-2 text-xs font-mono">
                            <span className={currentStep === 'anchor' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>01 ANCHOR</span>
                            <span className="text-gray-700">/</span>
                            <span className={currentStep === 'matrix' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>02 MATRIX</span>
                            <span className="text-gray-700">/</span>
                            <span className={currentStep === 'reality' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>03 REALITY</span>
                        </div>
                    </div>
                </nav>
            )}

            <main className="flex-grow relative overflow-hidden">
                {renderContent()}
            </main>
        </div>
    </div>
  );
}

export default App;
