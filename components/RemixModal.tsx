
import React from 'react';
import { RemixIcon, SparklesIcon, BrushIcon, XIcon } from './icons';
import { Hypothesis, RemixMode } from '../types';

interface RemixModalProps {
    hypothesis: Hypothesis;
    onClose: () => void;
    onConfirm: (mode: RemixMode) => void;
}

export const RemixModal: React.FC<RemixModalProps> = ({ hypothesis, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                        <RemixIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Remix Winner</h2>
                    <p className="text-gray-400 text-sm mt-2">This concept is a winner. How do you want to scale it?</p>
                </div>

                <div className="grid grid-cols-1 gap-4 p-6 bg-gray-950/50">
                    {/* Option 1: Scale Vibe */}
                    <button 
                        onClick={() => onConfirm('scale_vibe')}
                        className="group relative p-4 rounded-xl border border-gray-800 bg-gray-900 hover:border-cyan-500 hover:bg-gray-800 transition-all text-left flex gap-4 items-start"
                    >
                        <div className="p-3 bg-cyan-900/30 rounded-lg text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-transform">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400">Scale the Vibe</h3>
                            <p className="text-xs text-gray-400 mt-1">Keep the visual style (Format, Setting, etc.) but generate <strong>3 NEW HOOKS</strong>.</p>
                            <div className="mt-2 inline-block text-[10px] font-mono bg-cyan-900/50 text-cyan-200 px-2 py-0.5 rounded border border-cyan-700/50">Best for Copy Testing</div>
                        </div>
                    </button>

                    {/* Option 2: Scale Visual */}
                    <button 
                        onClick={() => onConfirm('scale_visual')}
                        className="group relative p-4 rounded-xl border border-gray-800 bg-gray-900 hover:border-purple-500 hover:bg-gray-800 transition-all text-left flex gap-4 items-start"
                    >
                        <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-transform">
                            <BrushIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-purple-400">Scale the Visual</h3>
                            <p className="text-xs text-gray-400 mt-1">Keep the winning Hook but randomize <strong>VISUAL VARIABLES</strong> (Angle, Lighting, etc.).</p>
                            <div className="mt-2 inline-block text-[10px] font-mono bg-purple-900/50 text-purple-200 px-2 py-0.5 rounded border border-purple-700/50">Best for Creative Fatigue</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
