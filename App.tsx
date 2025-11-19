
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { InputForm } from './components/InputForm';
import { MatrixBuilder } from './components/MatrixBuilder';
import { RealitySimulator } from './components/RealitySimulator';
import { MindMapCanvas } from './components/MindMapCanvas';
import { DnaValidationStep } from './components/DnaValidationStep';
import { AppStep, MatrixSlot, Hypothesis, ViewMode, RemixMode, CampaignBlueprint, TargetCountry, MATRIX_DEFAULTS, MatrixVar_Setting, MatrixVar_Lighting, MatrixVar_POV } from './types';
import { generateHypothesisImage, roastHypothesis, generateHookVariations } from './services/geminiService';
import { NetworkIcon, LayoutGridIcon } from './components/icons';

function simpleUUID() {
    return Math.random().toString(36).substring(2, 15);
}

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [viewMode, setViewMode] = useState<ViewMode>('linear');
  
  // Context State
  const [productContext, setProductContext] = useState('');
  const [goldenHook, setGoldenHook] = useState('');
  const [visualReference, setVisualReference] = useState<string | undefined>(undefined);
  const [targetCountry, setTargetCountry] = useState<string>('Global');
  const [brandName, setBrandName] = useState<string>('Brand');
  
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  
  // Safety: Prevent accidental close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hypotheses.length > 0) {
            e.preventDefault();
            e.returnValue = '';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hypotheses]);

  // Interim Blueprint State for Validation Step
  const [blueprint, setBlueprint] = useState<CampaignBlueprint>({
      brandName: '',
      productAnalysis: { name: '', keyBenefit: '' },
      targetPersona: { description: 'General Audience', age: '25-34', creatorType: 'UGC', painPoints: [], desiredOutcomes: [] },
      adDna: { 
          salesMechanism: 'Direct Response', copyPattern: 'Problem-Agitate-Solve', persuasionFormula: 'AIDA', 
          specificLanguagePatterns: [], toneOfVoice: 'Authentic', socialProofElements: '', objectionHandling: '', 
          visualStyle: 'Lo-Fi', targetCountry: 'Global', offerSummary: '', cta: 'Shop Now' 
      }
  });

  const handleAnchorConfirmed = (product: string, hook: string, visualRef: string | undefined, country: string, brand: string) => {
      setProductContext(product);
      setGoldenHook(hook);
      setVisualReference(visualRef);
      setTargetCountry(country);
      setBrandName(brand);
      
      setBlueprint(prev => ({
          ...prev,
          brandName: brand,
          visualReference: visualRef,
          productAnalysis: { ...prev.productAnalysis, name: product, keyBenefit: hook },
          adDna: { ...prev.adDna, targetCountry: country as TargetCountry }
      }));

      setCurrentStep('validateBlueprint');
  };

  const handleBlueprintValidated = (validatedBlueprint: CampaignBlueprint) => {
      setBlueprint(validatedBlueprint);
      setProductContext(validatedBlueprint.productAnalysis.name); 
      setCurrentStep('matrix');
  };

  const handleMatrixExecution = async (slots: Record<'A' | 'B' | 'C', MatrixSlot>) => {
      setCurrentStep('reality');
      
      const batchId = simpleUUID().substring(0, 4);
      
      const newHypotheses: Hypothesis[] = (['A', 'B', 'C'] as const).map(id => ({
          id: simpleUUID(),
          slotId: `${batchId}_${id}`,
          matrixConfig: slots[id],
          hook: goldenHook,
          visualPrompt: '',
          isGenerating: true,
          generationStatus: 'idle',
          brandName: brandName,
          overlay: { enabled: true, text: goldenHook, style: 'IG_Story', yPosition: 50 }
      }));
      
      setHypotheses(prev => [...prev, ...newHypotheses]);
      newHypotheses.forEach(h => generateImageForHypothesis(h));
  };

  const generateImageForHypothesis = async (h: Hypothesis) => {
      try {
          setHypotheses(prev => prev.map(item => item.id === h.id ? { ...item, isGenerating: true, generationStatus: 'prompting', error: undefined } : item));
          
          const imageUrl = await generateHypothesisImage(
              h.matrixConfig, 
              productContext, 
              h.hook,
              visualReference,
              targetCountry
          );
          
          setHypotheses(prev => prev.map(item => item.id === h.id ? { ...item, imageUrl, isGenerating: false, generationStatus: 'completed' } : item));
      } catch (e: any) {
          console.error("Generation error", e);
          setHypotheses(prev => prev.map(item => item.id === h.id ? { ...item, isGenerating: false, generationStatus: 'failed', error: e.message } : item));
      }
  };

  const handleRoast = async (id: string) => {
      const hypothesis = hypotheses.find(h => h.id === id);
      if(!hypothesis || !hypothesis.imageUrl) return;

      setHypotheses(prev => prev.map(item => item.id === id ? { ...item, generationStatus: 'roasting' } : item));

      try {
        const roastData = await roastHypothesis(hypothesis.imageUrl.split(',')[1], hypothesis.hook);
        setHypotheses(prev => prev.map(item => item.id === id ? { ...item, aiRoast: roastData, generationStatus: 'completed' } : item));
      } catch (e) {
          console.error("Roast failed", e);
          setHypotheses(prev => prev.map(item => item.id === id ? { ...item, generationStatus: 'completed' } : item));
      }
  };

  const handleUpdateHypothesis = (id: string, updates: Partial<Hypothesis>) => {
      setHypotheses(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };
  
  const handleAnchorUpdate = (newHook: string, updateOverlays: boolean) => {
      setGoldenHook(newHook);
      if (updateOverlays) {
          setHypotheses(prev => prev.map(h => ({
              ...h,
              hook: newHook,
              overlay: h.overlay ? { ...h.overlay, text: newHook } : undefined
          })));
      }
  };

  // --- SMART REMIX LOGIC ---
  
  const randomizeVisuals = (config: MatrixSlot): MatrixSlot => {
      const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      
      const settings: MatrixVar_Setting[] = ['Messy_Bedroom', 'Bathroom_Mirror_Dirty', 'Car_Dashboard_Traffic', 'Supermarket_Aisle', 'Street_Pavement', 'Kitchen_Table_Cluttered', 'Blank_Wall_Background'];
      const lightings: MatrixVar_Lighting[] = ['Harsh_Flash_ON', 'Bad_Fluorescent_Office', 'Dim_Bedroom_Lamp', 'Overexposed_Sunlight', 'Screen_Glow_Blue'];
      const povs: MatrixVar_POV[] = ['Selfie_Bad_Angle', 'First_Person_Shaky', 'Security_Cam_TopDown', 'Street_Level_Wide'];
      
      return {
          ...config,
          setting: getRandom(settings),
          lighting: getRandom(lightings),
          pov: getRandom(povs)
      };
  };

  const handleRemix = async (mode: RemixMode, parent: Hypothesis) => {
      if (mode === 'scale_vibe') {
          const newHooks = await generateHookVariations(parent.hook, productContext);
          
          const newHypotheses: Hypothesis[] = newHooks.map((hook, i) => ({
              id: simpleUUID(),
              slotId: `${parent.slotId}_vibe_${i+1}`,
              matrixConfig: { ...parent.matrixConfig },
              hook: hook,
              visualPrompt: '',
              isGenerating: true,
              generationStatus: 'idle',
              parentId: parent.id,
              brandName: brandName,
              overlay: { ...parent.overlay!, text: hook }
          }));
          
          setHypotheses(prev => [...prev, ...newHypotheses]);
          newHypotheses.forEach(h => generateImageForHypothesis(h));

      } else if (mode === 'scale_visual') {
          // Smart Remix: Actually randomize visuals
          const newHypotheses: Hypothesis[] = [1, 2, 3].map((i) => {
             const newConfig = randomizeVisuals(parent.matrixConfig);
             return {
                  id: simpleUUID(),
                  slotId: `${parent.slotId}_vis_${i}`,
                  matrixConfig: newConfig,
                  hook: parent.hook,
                  visualPrompt: '',
                  isGenerating: true,
                  generationStatus: 'idle',
                  parentId: parent.id,
                  brandName: brandName,
                  overlay: parent.overlay
             };
          });

          setHypotheses(prev => [...prev, ...newHypotheses]);
          newHypotheses.forEach(h => generateImageForHypothesis(h));
      }
  };

  const renderContent = () => {
      if (viewMode === 'canvas' && currentStep !== 'landing') {
          return (
            <MindMapCanvas 
                hypotheses={hypotheses}
                productContext={productContext}
                goldenHook={goldenHook}
                onRegenerate={(id) => { const h = hypotheses.find(i => i.id === id); if(h) generateImageForHypothesis(h); }}
                onRoast={handleRoast}
                onDuplicate={(h) => handleRemix('scale_visual', h)}
                onRemix={handleRemix}
                onUpdateHypothesis={handleUpdateHypothesis}
                onDelete={(id) => setHypotheses(prev => prev.filter(h => h.id !== id))}
                onUpdateAnchor={handleAnchorUpdate}
            />
          );
      }

      switch(currentStep) {
          case 'landing': return <LandingPage onStart={() => setCurrentStep('anchor')} />;
          case 'anchor': return <InputForm onConfirmAnchor={handleAnchorConfirmed} />;
          case 'validateBlueprint': return (
              <DnaValidationStep 
                initialBlueprint={blueprint} 
                referenceImage={visualReference ? `data:image/jpeg;base64,${visualReference}` : ''} 
                onStartCampaign={handleBlueprintValidated}
                onBack={() => setCurrentStep('anchor')}
                allowVisualExploration={false}
                onAllowVisualExplorationChange={() => {}}
              />
          );
          case 'matrix': return <MatrixBuilder onGenerate={handleMatrixExecution} />;
          case 'reality': return (
            <RealitySimulator 
                hypotheses={hypotheses} 
                onRegenerate={(id) => { const h = hypotheses.find(i => i.id === id); if(h) generateImageForHypothesis(h); }} 
                onRoast={handleRoast}
                onRemix={handleRemix}
                onUpdateHypothesis={handleUpdateHypothesis}
            />
          );
          default: return null;
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 flex flex-col min-h-screen h-screen">
            {currentStep !== 'landing' && (
                <nav className="border-b border-gray-800 bg-slate-900/80 backdrop-blur-md p-4 sticky top-0 z-50 flex-shrink-0">
                    <div className="max-w-full mx-auto flex justify-between items-center px-4">
                        <div className="font-black text-xl tracking-tighter text-white flex items-center gap-2">
                            CREATIVE<span className="text-cyan-500">OS</span> 
                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400 hidden sm:inline-block">v2.1 HYPOTHESIS ENGINE</span>
                        </div>
                        
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
                                    <NetworkIcon className="w-4 h-4" /> God Mode
                                </button>
                            </div>
                        )}

                        <div className="hidden md:flex gap-2 text-xs font-mono">
                            <span className={currentStep === 'anchor' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>01 ANCHOR</span>
                            <span className="text-gray-700">/</span>
                            <span className={currentStep === 'validateBlueprint' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>02 DNA</span>
                            <span className="text-gray-700">/</span>
                            <span className={currentStep === 'matrix' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>03 MATRIX</span>
                            <span className="text-gray-700">/</span>
                            <span className={currentStep === 'reality' ? 'text-cyan-400 font-bold' : 'text-gray-600'}>04 REALITY</span>
                        </div>
                    </div>
                </nav>
            )}

            <main className="flex-grow relative overflow-hidden overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    </div>
  );
}

export default App;
