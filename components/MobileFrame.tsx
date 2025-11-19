
import React, { useState, useEffect } from 'react';
import { Hypothesis, OverlayConfig, OverlayStyle } from '../types';
import { SparklesIcon, HeartIcon, RefreshCwIcon, Trash2Icon, RemixIcon, TypeIcon, DownloadIcon, SlidersIcon, PaletteIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from './icons';
import { compositeHypothesisImage } from '../services/exportService';
import saveAs from 'file-saver';

interface MobileFrameProps {
    hypothesis: Hypothesis;
    onRegenerate: () => void;
    onRoast: () => void;
    onDelete?: () => void;
    onRemix: () => void;
    onUpdateOverlay: (config: OverlayConfig) => void;
    scale?: number;
}

const FONTS = ['Classic', 'Modern', 'Neon', 'Typewriter', 'Meme'];

export const MobileFrame: React.FC<MobileFrameProps> = ({ hypothesis, onRegenerate, onRoast, onDelete, onRemix, onUpdateOverlay, scale = 1 }) => {
    const [isEditingOverlay, setIsEditingOverlay] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Dynamic Aspect Ratio Calculations
    const ratio = hypothesis.matrixConfig.aspectRatio || '9:16';
    const baseWidth = 300;
    let frameHeight = 533; // 9:16 default
    if (ratio === '1:1') frameHeight = 300;
    if (ratio === '4:5') frameHeight = 375;

    // Initialize config with defaults
    const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>(() => ({
        enabled: true,
        text: hypothesis.hook || '',
        style: 'IG_Story',
        yPosition: 50,
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        fontSize: 40,
        fontFamily: 'Classic',
        textAlign: 'center',
        ...hypothesis.overlay
    }));

    // Optimization: Low Detail Mode when zoomed out
    const isLowDetail = scale < 0.4;

    useEffect(() => {
        if (!isEditingOverlay) {
             setOverlayConfig(prev => ({
                 ...prev,
                 ...hypothesis.overlay,
                 text: hypothesis.hook // Keep text synced with golden hook unless manually edited
             }));
        }
    }, [hypothesis.overlay, hypothesis.hook, isEditingOverlay]);

    const handleOverlayChange = (partial: Partial<OverlayConfig>) => {
        const newConfig = { ...overlayConfig, ...partial };
        setOverlayConfig(newConfig);
        onUpdateOverlay(newConfig);
    };

    const handleDownloadSingle = async () => {
        setIsExporting(true);
        const blob = await compositeHypothesisImage({ ...hypothesis, overlay: overlayConfig });
        if (blob) {
            saveAs(blob, `CreativeOS_${hypothesis.slotId}.jpg`);
        }
        setIsExporting(false);
    };

    // --- DYNAMIC UI LOGIC ---
    
    // Generate dynamic hashtags/captions based on Persona
    const getPersonaContext = (persona: string) => {
        switch(persona) {
            case 'Stressed_Parent': return { tags: '#momlife #parenthood #tired', caption: 'Every. Single. Day. 🫠' };
            case 'Gen_Z_Real': return { tags: '#fyp #trending #pov', caption: 'Wait for the end 💀' };
            case 'Blue_Collar_Worker': return { tags: '#worklife #grind #hustle', caption: 'Finally found something that works.' };
            case 'Skeptical_User': return { tags: '#review #honest #truth', caption: 'I thought this was a scam...' };
            case 'Anonymous_Poster': return { tags: '#confession #secret', caption: 'Dont tell anyone I posted this.' };
            default: return { tags: '#lifehack #fyp', caption: 'Game changer.' };
        }
    };

    const personaContext = getPersonaContext(hypothesis.matrixConfig.persona);
    const randomLikes = (Math.random() * (500 - 10) + 10).toFixed(1);

    const renderOverlayText = () => {
        if (!overlayConfig.enabled) return null;
        
        const topPos = `${overlayConfig.yPosition}%`;
        const textAlignClass = overlayConfig.textAlign === 'left' ? 'text-left' : overlayConfig.textAlign === 'right' ? 'text-right' : 'text-center';
        
        const fontMap: Record<string, string> = {
            'Classic': 'font-sans',
            'Modern': 'font-[Montserrat]',
            'Neon': 'font-mono',
            'Typewriter': 'font-serif',
            'Meme': 'font-[Impact]'
        };
        const fontClass = fontMap[overlayConfig.fontFamily || 'Classic'] || 'font-sans';
        const fontSizePx = (baseWidth * ((overlayConfig.fontSize || 40) / 100)) * 0.15; 

        return (
            <div className={`absolute left-0 w-full px-4 pointer-events-none z-20 flex flex-col ${overlayConfig.textAlign === 'left' ? 'items-start' : overlayConfig.textAlign === 'right' ? 'items-end' : 'items-center'}`} style={{ top: topPos, transform: 'translateY(-50%)' }}>
                <span 
                    className={`inline-block rounded px-2 py-1 whitespace-pre-wrap ${fontClass} ${textAlignClass}`}
                    style={{
                        color: overlayConfig.color,
                        fontSize: `${Math.max(10, fontSizePx)}px`,
                        lineHeight: 1.2,
                        backgroundColor: overlayConfig.backgroundColor,
                        textShadow: overlayConfig.style === 'TikTok_Modern' || overlayConfig.style === 'Meme_Impact' ? '1px 1px 0 #000' : 'none',
                        WebkitTextStroke: overlayConfig.style === 'Meme_Impact' ? '0.5px black' : 'none'
                    }}
                >
                    {overlayConfig.text}
                </span>
            </div>
        );
    };

    if (isLowDetail) {
        return (
            <div style={{ width: baseWidth, height: frameHeight }} className="bg-black rounded-[2rem] border-8 border-gray-800 overflow-hidden flex items-center justify-center shadow-2xl transition-all">
                {hypothesis.imageUrl ? <img src={hypothesis.imageUrl} className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full bg-gray-900" />}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 z-10">
            {/* Frame Container */}
            <div 
                style={{ width: baseWidth, height: frameHeight }}
                className={`relative bg-black rounded-[2rem] border-8 overflow-hidden shadow-2xl transition-all duration-500 ${hypothesis.aiRoast && hypothesis.aiRoast.thumbstopScore > 80 ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'border-gray-800'}`}
            >
                {ratio === '9:16' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-30"></div>}

                <div className="w-full h-full relative bg-gray-900 group">
                    {hypothesis.isGenerating ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-green-500 font-mono p-4 text-center animate-pulse">
                            <SparklesIcon className="w-8 h-8 mb-4" />
                            <div className="uppercase font-bold text-sm">{hypothesis.generationStatus?.replace('_', ' ') || 'PROCESSING'}...</div>
                            <div className="text-xs text-gray-500 mt-2">AI is building your hypothesis</div>
                        </div>
                    ) : hypothesis.imageUrl ? (
                        <img src={hypothesis.imageUrl} alt="Generated Ad" className="w-full h-full object-cover" />
                    ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-600">Waiting...</div>
                    )}
                    
                    {hypothesis.imageUrl && renderOverlayText()}

                    {/* DYNAMIC FAKE UI LAYER */}
                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
                        {/* Top Bar */}
                        <div className="flex justify-between items-center pt-2 text-white drop-shadow-md opacity-70">
                             {/* Brand Name Injection */}
                            <div className="text-[10px] font-bold">{hypothesis.brandName || 'YourBrand'}</div>
                            <div className="text-[8px] bg-gray-500/50 px-1 rounded">Sponsored</div>
                        </div>

                        {/* Bottom Content */}
                        <div className="text-white drop-shadow-lg pb-8 opacity-90">
                            <div className="font-bold text-xs mb-1">@{hypothesis.matrixConfig.persona.toLowerCase().replace(/_/g, '.')}</div>
                            <div className="text-xs mb-2 opacity-80 leading-tight">
                                {personaContext.caption} {personaContext.tags}
                            </div>
                            {/* Fake CTA Button */}
                            <div className="w-full py-2 text-center font-bold text-[10px] rounded bg-blue-600 text-white animate-pulse">
                                Shop Now &gt;
                            </div>
                        </div>

                        {/* Side Action Bar */}
                        <div className="absolute right-2 bottom-20 flex flex-col gap-4 items-center text-white opacity-90">
                             <div className="flex flex-col items-center">
                                 <HeartIcon className="w-6 h-6" />
                                 <span className="text-[10px] font-bold">{randomLikes}K</span>
                             </div>
                             <div className="flex flex-col items-center">
                                <div className="w-6 h-6 bg-gray-200/20 rounded-full flex items-center justify-center">💬</div>
                                <span className="text-[10px] font-bold">Share</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="w-[300px] bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2 relative group">
                {onDelete && (
                    <button onClick={onDelete} className="absolute -top-2 -right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700" title="Delete">
                        <Trash2Icon className="w-4 h-4" />
                    </button>
                )}

                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Slot {hypothesis.slotId} ({ratio})</span>
                    <div className="flex gap-1">
                         <button onClick={() => setIsEditingOverlay(!isEditingOverlay)} className={`p-1.5 rounded ${isEditingOverlay ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`} title="Edit Overlay">
                            <TypeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={onRemix} disabled={!hypothesis.imageUrl} className="p-1.5 bg-gray-800 text-purple-400 hover:bg-purple-900/30 hover:text-purple-300 rounded disabled:opacity-50" title="Remix">
                            <RemixIcon className="w-4 h-4" />
                        </button>
                        <button onClick={handleDownloadSingle} disabled={!hypothesis.imageUrl || isExporting} className="p-1.5 bg-gray-800 text-green-400 hover:bg-green-900/30 hover:text-green-300 rounded disabled:opacity-50" title="Download">
                            {isExporting ? <RefreshCwIcon className="w-4 h-4 animate-spin"/> : <DownloadIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {isEditingOverlay ? (
                    <div className="space-y-3 animate-fadeIn">
                        <textarea 
                            value={overlayConfig.text} 
                            onChange={(e) => handleOverlayChange({ text: e.target.value })} 
                            rows={2} 
                            className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Text..."
                        />
                        <div className="grid grid-cols-2 gap-2">
                             <select 
                                value={overlayConfig.fontFamily} 
                                onChange={(e) => handleOverlayChange({ fontFamily: e.target.value })}
                                className="bg-gray-800 text-xs text-white p-1 rounded border border-gray-700"
                             >
                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                             </select>
                             <div className="flex bg-gray-800 rounded border border-gray-700 overflow-hidden">
                                <button onClick={() => handleOverlayChange({ textAlign: 'left' })} className={`flex-1 flex justify-center items-center ${overlayConfig.textAlign === 'left' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}><AlignLeftIcon className="w-3 h-3"/></button>
                                <button onClick={() => handleOverlayChange({ textAlign: 'center' })} className={`flex-1 flex justify-center items-center ${overlayConfig.textAlign === 'center' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}><AlignCenterIcon className="w-3 h-3"/></button>
                                <button onClick={() => handleOverlayChange({ textAlign: 'right' })} className={`flex-1 flex justify-center items-center ${overlayConfig.textAlign === 'right' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}><AlignRightIcon className="w-3 h-3"/></button>
                             </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <TypeIcon className="w-3 h-3 text-gray-500" />
                                <input type="range" min="10" max="100" value={overlayConfig.fontSize} onChange={(e) => handleOverlayChange({ fontSize: parseInt(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                            </div>
                            <div className="flex items-center gap-2">
                                <SlidersIcon className="w-3 h-3 text-gray-500" />
                                <input type="range" min="10" max="90" value={overlayConfig.yPosition} onChange={(e) => handleOverlayChange({ yPosition: parseInt(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-800">
                            <input type="checkbox" checked={overlayConfig.enabled} onChange={(e) => handleOverlayChange({ enabled: e.target.checked })} />
                            <span>Show Overlay</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                         {hypothesis.aiRoast ? (
                            <div className="flex-1 bg-gray-800 p-2 rounded text-xs">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold ${hypothesis.aiRoast.thumbstopScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>Score: {hypothesis.aiRoast.thumbstopScore}</span>
                                </div>
                                <p className="text-gray-400 italic line-clamp-1 text-[10px]">"{hypothesis.aiRoast.critique}"</p>
                            </div>
                        ) : (
                            <button onClick={onRoast} disabled={!hypothesis.imageUrl} className="flex-1 py-1.5 bg-purple-900/30 text-purple-300 border border-purple-800 rounded text-xs font-bold hover:bg-purple-900/50">Analyze Ad</button>
                        )}
                        <button onClick={onRegenerate} className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded text-xs font-bold hover:bg-gray-700">
                            <RefreshCwIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
