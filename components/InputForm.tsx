
import React, { useState, useRef } from 'react';
import { LockIcon, UnlockIcon, UploadIcon, FileTextIcon, SparklesIcon, ScanEyeIcon, GlobeIcon, TagIcon } from './icons';
import { extractAnchorFromImage, extractAnchorFromText } from '../services/geminiService';
import { TargetCountry } from '../types';

interface InputFormProps {
  onConfirmAnchor: (productInfo: string, goldenHook: string, visualRef: string | undefined, country: string, brandName: string) => void;
}

type InputMode = 'manual' | 'image_scan' | 'text_scan';

export const InputForm: React.FC<InputFormProps> = ({ onConfirmAnchor }) => {
  const [productInfo, setProductInfo] = useState('');
  const [goldenHook, setGoldenHook] = useState('');
  const [brandName, setBrandName] = useState(''); 
  const [targetCountry, setTargetCountry] = useState<string>('Global');
  const [isCustomCountry, setIsCustomCountry] = useState(false);
  const [visualReference, setVisualReference] = useState<string | undefined>(undefined);
  
  const [isLocked, setIsLocked] = useState(false);
  const [mode, setMode] = useState<InputMode>('manual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productRefRef = useRef<HTMLInputElement>(null);
  const [rawText, setRawText] = useState('');

  const handleLock = (e: React.FormEvent) => {
      e.preventDefault();
      if(!productInfo || !goldenHook || !brandName) return alert("Please fill in all fields, including Brand Name.");
      setIsLocked(true);
      onConfirmAnchor(productInfo, goldenHook, visualReference, targetCountry, brandName);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setIsAnalyzing(true);
          
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64String = (reader.result as string).split(',')[1];
              try {
                  const result = await extractAnchorFromImage(base64String);
                  setProductInfo(result.productInfo);
                  setGoldenHook(result.goldenHook);
                  setMode('manual'); 
              } catch (error) {
                  console.error(error);
                  alert("Could not analyze image. Please try manual input.");
              } finally {
                  setIsAnalyzing(false);
              }
          };
          reader.readAsDataURL(file);
      }
  };
  
  const handleVisualRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = (reader.result as string).split(',')[1];
              setVisualReference(base64String);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleTextAnalysis = async () => {
      if (!rawText.trim()) return;
      setIsAnalyzing(true);
      try {
          const result = await extractAnchorFromText(rawText);
          setProductInfo(result.productInfo);
          setGoldenHook(result.goldenHook);
          setMode('manual');
      } catch (error) {
          console.error(error);
          alert("Could not analyze text. Please try manual input.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 pb-20">
      <div className={`bg-gray-900 border-2 ${isLocked ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-gray-700'} rounded-xl p-8 transition-all duration-500`}>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-slate-200">
                    Phase 1: The Anchor
                </h2>
                <p className="text-xs text-gray-400 mt-1">Define your control variables.</p>
            </div>
            {isLocked ? <LockIcon className="w-6 h-6 text-green-500" /> : <UnlockIcon className="w-6 h-6 text-gray-500" />}
        </div>

        {/* Source Selector */}
        {!isLocked && (
            <div className="grid grid-cols-3 gap-2 mb-8 bg-gray-950 p-1 rounded-lg border border-gray-800">
                <button 
                    onClick={() => setMode('manual')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${mode === 'manual' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <span className="text-lg">✍️</span> Manual
                </button>
                <button 
                    onClick={() => setMode('image_scan')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${mode === 'image_scan' ? 'bg-indigo-900/50 text-indigo-200 shadow-lg border border-indigo-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <ScanEyeIcon className="w-4 h-4" /> Scan Ad Image
                </button>
                <button 
                    onClick={() => setMode('text_scan')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${mode === 'text_scan' ? 'bg-emerald-900/50 text-emerald-200 shadow-lg border border-emerald-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <FileTextIcon className="w-4 h-4" /> Analyze Text
                </button>
            </div>
        )}

        {/* Content Area */}
        <div className="relative min-h-[200px]">
            
            {isAnalyzing && (
                <div className="absolute inset-0 z-20 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                    <SparklesIcon className="w-10 h-10 text-cyan-500 animate-spin mb-3" />
                    <p className="text-cyan-400 font-bold text-lg animate-pulse">Extracting Strategy DNA...</p>
                    <p className="text-gray-500 text-xs">Analyzing context & detecting hooks</p>
                </div>
            )}

            {mode === 'image_scan' && !isLocked && (
                <div className="border-2 border-dashed border-indigo-500/50 bg-indigo-900/10 rounded-xl p-8 text-center transition-all hover:bg-indigo-900/20 hover:border-indigo-400">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 text-indigo-400">
                            <UploadIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-indigo-200">Upload Winning Ad</h3>
                        <p className="text-sm text-indigo-300/70 mt-2 max-w-xs mx-auto">
                            Upload a screenshot of your best performing ad. AI will extract the product context and the golden hook.
                        </p>
                        <button className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg">
                            Select Image
                        </button>
                    </div>
                </div>
            )}

            {mode === 'text_scan' && !isLocked && (
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-emerald-500 uppercase">Paste Landing Page / Ad Copy</label>
                    <textarea 
                        value={rawText}
                        onChange={e => setRawText(e.target.value)}
                        className="w-full bg-emerald-950/20 border border-emerald-900/50 text-emerald-100 rounded-lg p-4 focus:ring-2 focus:ring-emerald-500 outline-none h-40 text-sm font-mono"
                        placeholder="Paste your website text, product description, or ad caption here..."
                    />
                    <button 
                        onClick={handleTextAnalysis}
                        disabled={!rawText}
                        className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                        <SparklesIcon className="w-4 h-4" /> Extract Data
                    </button>
                </div>
            )}

            {(mode === 'manual' || isLocked) && (
                <form onSubmit={handleLock} className="space-y-6 animate-fadeIn">
                    
                    {/* Brand & Country */}
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                <TagIcon className="w-3 h-3" /> Brand Name
                            </label>
                            <input 
                                disabled={isLocked}
                                value={brandName}
                                onChange={e => setBrandName(e.target.value)}
                                className={`w-full bg-gray-950 border ${isLocked ? 'border-green-900 text-gray-400' : 'border-gray-700 text-white'} rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none text-sm`}
                                placeholder="e.g. Nike, Kopi Kenangan"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                <GlobeIcon className="w-3 h-3" /> Target Country
                            </label>
                            {isCustomCountry ? (
                                <div className="flex gap-2">
                                    <input 
                                        disabled={isLocked}
                                        value={targetCountry}
                                        onChange={e => setTargetCountry(e.target.value)}
                                        className={`w-full bg-gray-950 border ${isLocked ? 'border-green-900 text-gray-400' : 'border-gray-700 text-white'} rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none text-sm`}
                                        placeholder="Type Country..."
                                        autoFocus
                                    />
                                    <button type="button" onClick={() => setIsCustomCountry(false)} className="text-xs underline text-gray-500">Cancel</button>
                                </div>
                            ) : (
                                <select 
                                    disabled={isLocked}
                                    value={targetCountry}
                                    onChange={e => {
                                        if(e.target.value === 'custom') {
                                            setTargetCountry('');
                                            setIsCustomCountry(true);
                                        } else {
                                            setTargetCountry(e.target.value);
                                        }
                                    }}
                                    className={`w-full bg-gray-950 border ${isLocked ? 'border-green-900 text-gray-400' : 'border-gray-700 text-white'} rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 outline-none text-sm`}
                                >
                                    <option value="Global">Global / Generic</option>
                                    <option value="Indonesia">Indonesia</option>
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                    <option value="Brazil">Brazil</option>
                                    <option value="custom">✨ Custom Location...</option>
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Product Context & Image */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="block text-xs font-bold text-cyan-500 uppercase">Product Context</label>
                            {!isLocked && (
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        ref={productRefRef} 
                                        onChange={handleVisualRefUpload} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => productRefRef.current?.click()}
                                        className={`text-xs flex items-center gap-1 ${visualReference ? 'text-green-400' : 'text-gray-500 hover:text-cyan-400'}`}
                                    >
                                        <UploadIcon className="w-3 h-3" />
                                        {visualReference ? 'Image Uploaded (Ready)' : 'Upload Reference Image (Optional)'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <textarea 
                            disabled={isLocked}
                            value={productInfo}
                            onChange={e => setProductInfo(e.target.value)}
                            className={`w-full bg-gray-950 border ${isLocked ? 'border-green-900 text-gray-400' : 'border-gray-700 text-white'} rounded-lg p-4 focus:ring-2 focus:ring-cyan-500 outline-none transition-all`}
                            rows={3}
                            placeholder="Describe the product clearly (e.g. 'A pink square bottle')..."
                        />
                        {visualReference && isLocked && (
                            <div className="text-[10px] text-green-500 flex items-center gap-1">
                                <SparklesIcon className="w-3 h-3" /> Using Visual Reference for AI Generation
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-yellow-500 uppercase mb-2">The Golden Hook (Main Offer)</label>
                        <input 
                            disabled={isLocked}
                            value={goldenHook}
                            onChange={e => setGoldenHook(e.target.value)}
                            type="text"
                            className={`w-full bg-gray-950 border ${isLocked ? 'border-green-900 text-gray-400' : 'border-gray-700 text-white'} rounded-lg p-4 text-lg font-bold focus:ring-2 focus:ring-yellow-500 outline-none transition-all`}
                            placeholder="e.g. Garansi Uang Kembali Dalam 3 Hari"
                        />
                    </div>

                    {!isLocked && (
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase py-4 rounded-lg tracking-widest transition-all hover:scale-[1.02]">
                            Lock & Validate DNA
                        </button>
                    )}
                </form>
            )}

            {isLocked && (
                <div className="mt-6 text-center text-green-500 font-mono text-sm animate-pulse border-t border-green-900/30 pt-4">
                    /// SYSTEM LOCKED. REDIRECTING TO DNA VALIDATION...
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
