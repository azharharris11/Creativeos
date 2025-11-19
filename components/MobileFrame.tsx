
import React, { useState, useEffect } from 'react';
import { Hypothesis, OverlayConfig, OverlayStyle } from '../types';
import { SparklesIcon, HeartIcon, RefreshCwIcon, Trash2Icon, RemixIcon, TypeIcon, DownloadIcon, SlidersIcon } from './icons';
import { compositeHypothesisImage } from '../services/exportService';
import saveAs from 'file-saver';

interface MobileFrameProps {
    hypothesis: Hypothesis;
    onRegenerate: () => void;
    onRoast: () => void;
    onDelete?: () => void;
    onRemix: () => void;
    onUpdateOverlay: (config: OverlayConfig) => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ hypothesis, onRegenerate, onRoast, onDelete, onRemix, onUpdateOverlay }) => {
    // Local state for editing to prevent excessive parent re-renders
    const [isEditingOverlay, setIsEditingOverlay] = useState(false);
    const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>(
        hypothesis.overlay || { enabled: true, text: hypothesis.hook, style: 'IG_Story', yPosition: 50 }
    );
    const [isExporting, setIsExporting] = useState(false);

    // Sync local state when prop changes (if not editing)
    useEffect(() => {
        if (!isEditingOverlay && hypothesis.overlay) {
            setOverlayConfig(hypothesis.overlay);
        } else if (!hypothesis.overlay) {
             setOverlayConfig({ enabled: true, text: hypothesis.hook, style: 'IG_Story', yPosition: 50 });
        }
    }, [hypothesis.overlay, isEditingOverlay, hypothesis.hook]);

    const handleOverlayChange = (partial: Partial<OverlayConfig>) => {
        const newConfig = { ...overlayConfig, ...partial };
        setOverlayConfig(newConfig);
        onUpdateOverlay(newConfig); // Sync to parent immediately for "Export All" to work correctly
    };

    const handleDownloadSingle = async () => {
        setIsExporting(true);
        const blob = await compositeHypothesisImage({ ...hypothesis, overlay: overlayConfig });
        if (blob) {
            saveAs(blob, `CreativeOS_${hypothesis.slotId}.jpg`);
        }
        setIsExporting(false);
    };

    // Render text based on style
    const renderOverlayText = () => {
        if (!overlayConfig.enabled) return null;
        
        const topPos = `${overlayConfig.yPosition}%`;
        
        if (overlayConfig.style === 'IG_Story') {
            return (
                <div className="absolute left-0 w-full text-center px-4 pointer-events-none z-20" style={{ top: topPos, transform: 'translateY(-50%)' }}>
                    <span className="inline-block bg-white text-black font-black px-2 py-1 rounded text-lg leading-tight shadow-lg whitespace-pre-wrap">
                        {overlayConfig.text}
                    </span>
                </div>
            );
        } else if (overlayConfig.style === 'TikTok_Modern') {
            return (
                <div className="absolute left-0 w-full text-center px-4 pointer-events-none z-20" style={{ top: topPos, transform: 'translateY(-50%)' }}>
                    <span className="font-bold text-white text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-pre-wrap" style={{ WebkitTextStroke: '0.5px black' }}>
                        {overlayConfig.text}
                    </span>
                </div>
            );
        } else { // Meme
            return (
                <div className="absolute left-0 w-full text-center px-2 pointer-events-none z-20" style={{ top: topPos, transform: 'translateY(-50%)' }}>
                    <span className="font-black text-white text-2xl uppercase tracking-wide whitespace-pre-wrap" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                        {overlayConfig.text}
                    </span>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Phone Frame */}
            <div className={`relative w-[300px] h-[533px] bg-black rounded-[3rem] border-8 overflow-hidden shadow-2xl transition-all duration-500 ${hypothesis.aiRoast && hypothesis.aiRoast.thumbstopScore > 80 ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'border-gray-800'}`}>
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-30"></div>

                <div className="w-full h-full relative bg-gray-900">
                    {hypothesis.isGenerating ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-green-500 font-mono p-4 text-center animate-pulse">
                            <SparklesIcon className="w-8 h-8 mb-4" />
                            <div>GENERATING VISUALS...</div>
                        </div>
                    ) : hypothesis.imageUrl ? (
                        <img src={hypothesis.imageUrl} alt="Generated Ad" className="w-full h-full object-cover" />
                    ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-600">Waiting...</div>
                    )}
                    
                    {/* Text Overlay Render */}
                    {hypothesis.imageUrl && renderOverlayText()}

                    {/* Fake UI Overlay (Static) */}
                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
                        <div className="flex justify-between items-center pt-2 text-white drop-shadow-md opacity-70">
                            <div className="text-[10px] font-bold">Brand</div>
                            <div className="text-[8px] bg-gray-500/50 px-1 rounded">Sponsored</div>
                        </div>
                        <div className="text-white drop-shadow-lg pb-8 opacity-90">
                            <div className="font-bold text-xs mb-1">@{hypothesis.matrixConfig.persona}</div>
                            <div className="text-xs mb-2 opacity-80">Check out this product... #fyp</div>
                            <div className="w-full py-2 text-center font-bold text-[10px] rounded bg-blue-600 text-white">Shop Now</div>
                        </div>
                        <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center text-white opacity-90">
                             <HeartIcon className="w-6 h-6" />
                             <div className="text-[10px] font-bold">1.2M</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="w-[300px] bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3 relative group">
                {onDelete && (
                    <button onClick={onDelete} className="absolute -top-2 -right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700" title="Delete">
                        <Trash2Icon className="w-4 h-4" />
                    </button>
                )}

                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono">SLOT {hypothesis.slotId}</span>
                    <div className="flex gap-1">
                         <button onClick={() => setIsEditingOverlay(!isEditingOverlay)} className={`p-1.5 rounded ${isEditingOverlay ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`} title="Edit Text Overlay">
                            <TypeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={onRemix} disabled={!hypothesis.imageUrl} className="p-1.5 bg-gray-800 text-purple-400 hover:bg-purple-900/30 hover:text-purple-300 rounded transition-colors disabled:opacity-50" title="Remix Winner">
                            <RemixIcon className="w-4 h-4" />
                        </button>
                        <button onClick={handleDownloadSingle} disabled={!hypothesis.imageUrl || isExporting} className="p-1.5 bg-gray-800 text-green-400 hover:bg-green-900/30 hover:text-green-300 rounded transition-colors disabled:opacity-50" title="Download">
                            {isExporting ? <RefreshCwIcon className="w-4 h-4 animate-spin"/> : <DownloadIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {isEditingOverlay ? (
                    <div className="space-y-3 pt-2 border-t border-gray-800 animate-fadeIn">
                        <textarea 
                            value={overlayConfig.text} 
                            onChange={(e) => handleOverlayChange({ text: e.target.value })} 
                            rows={2} 
                            className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Overlay text..."
                        />
                        
                        <div className="flex justify-between gap-2">
                            {(['IG_Story', 'TikTok_Modern', 'Meme_Impact'] as OverlayStyle[]).map(style => (
                                <button 
                                    key={style} 
                                    onClick={() => handleOverlayChange({ style })} 
                                    className={`flex-1 py-1 text-[10px] font-bold rounded border ${overlayConfig.style === style ? 'bg-indigo-900 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                                >
                                    {style.split('_')[0]}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <SlidersIcon className="w-3 h-3 text-gray-500" />
                            <input 
                                type="range" 
                                min="10" 
                                max="90" 
                                value={overlayConfig.yPosition} 
                                onChange={(e) => handleOverlayChange({ yPosition: parseInt(e.target.value) })} 
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <input type="checkbox" checked={overlayConfig.enabled} onChange={(e) => handleOverlayChange({ enabled: e.target.checked })} />
                            <span>Show Overlay</span>
                        </div>
                    </div>
                ) : (
                    <>
                         {hypothesis.aiRoast ? (
                            <div className="bg-gray-800 p-2 rounded text-xs">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold ${hypothesis.aiRoast.thumbstopScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>Score: {hypothesis.aiRoast.thumbstopScore}</span>
                                </div>
                                <p className="text-gray-400 italic line-clamp-2">"{hypothesis.aiRoast.critique}"</p>
                            </div>
                        ) : (
                            <button onClick={onRoast} disabled={!hypothesis.imageUrl} className="w-full py-1.5 bg-purple-900/30 text-purple-300 border border-purple-800 rounded text-xs font-bold hover:bg-purple-900/50">Analyze Ad</button>
                        )}
                        <button onClick={onRegenerate} className="w-full py-1.5 bg-gray-800 text-gray-300 rounded text-xs font-bold hover:bg-gray-700 flex items-center justify-center gap-2">
                            <RefreshCwIcon className="w-3 h-3" /> Regenerate Visuals
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
