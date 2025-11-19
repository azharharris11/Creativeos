
import React, { useState } from 'react';
import { Hypothesis } from '../types';
import { SparklesIcon, HeartIcon, RefreshCwIcon, Trash2Icon } from './icons';

interface MobileFrameProps {
    hypothesis: Hypothesis;
    onRegenerate: () => void;
    onRoast: () => void;
    onDelete?: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ hypothesis, onRegenerate, onRoast, onDelete }) => {
    const [overlayMode, setOverlayMode] = useState<'IG' | 'TikTok' | 'None'>('IG');

    // Dynamic Border based on Roast Score
    const getBorderClass = () => {
        const score = hypothesis.aiRoast?.thumbstopScore;
        if (score === undefined) return 'border-gray-800';
        if (score > 80) return 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)]'; // Neon Green Winner
        if (score < 50) return 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]'; // Red Fail
        return 'border-gray-800'; // Neutral
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Phone Frame */}
            <div className={`relative w-[300px] h-[533px] bg-black rounded-[3rem] border-8 overflow-hidden shadow-2xl transition-all duration-500 ${getBorderClass()}`}>
                
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-20"></div>

                {/* Content Layer */}
                <div className="w-full h-full relative bg-gray-900">
                    {hypothesis.isGenerating ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-green-500 font-mono p-4 text-center animate-pulse">
                            <SparklesIcon className="w-8 h-8 mb-4" />
                            <div>INJECTING CHAOS...</div>
                            <div className="text-xs mt-2 text-gray-500">{hypothesis.matrixConfig.format} Protocol</div>
                        </div>
                    ) : hypothesis.imageUrl ? (
                        <img src={hypothesis.imageUrl} alt="Generated Ad" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                             <div className="text-center">
                                <p>Waiting for generation...</p>
                                <button onClick={onRegenerate} className="mt-4 px-4 py-2 bg-indigo-600 rounded text-sm">Generate</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Overlay Layer */}
                {overlayMode !== 'None' && hypothesis.imageUrl && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
                        {/* Top Bar */}
                        <div className="flex justify-between items-center pt-2 text-white drop-shadow-md">
                            <div className="text-xs font-bold">Brand Name</div>
                            <div className="text-xs bg-gray-500/50 px-2 py-1 rounded">Sponsored</div>
                        </div>

                        {/* Bottom Overlay */}
                        <div className="text-white drop-shadow-lg pb-8">
                            <div className="font-bold text-sm mb-1">@{hypothesis.matrixConfig.persona}</div>
                            <div className="text-sm leading-tight mb-2">{hypothesis.hook}</div>
                            <div className={`w-full py-2 text-center font-bold text-xs rounded ${overlayMode === 'IG' ? 'bg-blue-500' : 'bg-red-500'}`}>
                                Shop Now
                            </div>
                        </div>
                        
                        {/* Side Icons (TikTok style) */}
                        {overlayMode === 'TikTok' && (
                            <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center text-white">
                                <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
                                <HeartIcon className="w-8 h-8" />
                                <div className="text-xs font-bold">1.2M</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Control Panel */}
            <div className="w-[300px] bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3 relative group">
                {onDelete && (
                    <button 
                        onClick={onDelete} 
                        className="absolute -top-2 -right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                        title="Delete Hypothesis"
                    >
                        <Trash2Icon className="w-4 h-4" />
                    </button>
                )}

                <div className="flex justify-between text-xs text-gray-400 font-mono">
                    <span>SLOT {hypothesis.slotId}</span>
                    <span>{hypothesis.matrixConfig.format}</span>
                </div>
                
                <div className="flex gap-2 justify-center">
                    <button onClick={() => setOverlayMode('IG')} className={`text-xs px-2 py-1 rounded ${overlayMode === 'IG' ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}>IG</button>
                    <button onClick={() => setOverlayMode('TikTok')} className={`text-xs px-2 py-1 rounded ${overlayMode === 'TikTok' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}>TikTok</button>
                    <button onClick={() => setOverlayMode('None')} className={`text-xs px-2 py-1 rounded ${overlayMode === 'None' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>Off</button>
                </div>

                {hypothesis.aiRoast ? (
                    <div className="bg-gray-800 p-2 rounded text-xs">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold ${hypothesis.aiRoast.thumbstopScore > 80 ? 'text-green-400' : hypothesis.aiRoast.thumbstopScore < 50 ? 'text-red-400' : 'text-yellow-400'}`}>
                                Score: {hypothesis.aiRoast.thumbstopScore}/100
                            </span>
                            <span className="text-gray-400">{hypothesis.aiRoast.vibe}</span>
                        </div>
                        <p className="text-gray-300 italic border-l-2 border-red-500 pl-2">"{hypothesis.aiRoast.critique}"</p>
                    </div>
                ) : (
                    <button 
                        onClick={onRoast} 
                        disabled={hypothesis.isGenerating || !hypothesis.imageUrl}
                        className="w-full py-2 bg-purple-900/50 hover:bg-purple-900 text-purple-200 text-xs font-bold uppercase rounded border border-purple-700 transition-colors disabled:opacity-50"
                    >
                        Run AI Roast
                    </button>
                )}

                <button 
                    onClick={onRegenerate} 
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-2"
                >
                    <RefreshCwIcon className="w-3 h-3" /> Regenerate (Inject Chaos)
                </button>
            </div>
        </div>
    );
};
