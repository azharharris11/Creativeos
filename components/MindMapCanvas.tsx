
import React, { useRef, useEffect, useState } from 'react';
import { Hypothesis, MatrixSlot } from '../types';
import { ZoomInIcon, ZoomOutIcon, LocateIcon, CopyIcon, ShieldAlertIcon } from './icons';
import { MobileFrame } from './MobileFrame';

export interface MindMapCanvasProps {
    hypotheses: Hypothesis[];
    productContext: string;
    goldenHook: string;
    onRegenerate: (id: string) => void;
    onRoast: (id: string) => void;
    onDuplicate: (hypothesis: Hypothesis) => void;
    onDelete: (id: string) => void;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ hypotheses, productContext, goldenHook, onRegenerate, onRoast, onDuplicate, onDelete }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState({ x: 0, y: 0, k: 0.5 }); // Start zoomed out
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    // Layout Logic: Hub & Spoke
    // Center: Anchor
    // Spokes: Hypotheses arranged in a circle/grid
    const getPositions = () => {
        const centerX = 0;
        const centerY = 0;
        const radius = 600; // Distance from center
        const count = hypotheses.length;
        
        return hypotheses.map((h, index) => {
            const angle = (index / count) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return { ...h, x, y };
        });
    };

    const positionedHypotheses = getPositions();

    // Similarity Radar Logic
    const getSimilarityLines = () => {
        const lines = [];
        for (let i = 0; i < positionedHypotheses.length; i++) {
            for (let j = i + 1; j < positionedHypotheses.length; j++) {
                const h1 = positionedHypotheses[i];
                const h2 = positionedHypotheses[j];
                
                let score = 0;
                const keys = Object.keys(h1.matrixConfig) as (keyof MatrixSlot)[];
                keys.forEach(k => { 
                    if (k !== 'id' && h1.matrixConfig[k] === h2.matrixConfig[k]) score++; 
                });

                if (score >= 5) { // High similarity threshold
                    lines.push({ x1: h1.x, y1: h1.y, x2: h2.x, y2: h2.y, score });
                }
            }
        }
        return lines;
    };

    const similarityLines = getSimilarityLines();

    // Pan & Zoom Handlers
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handleMouseDown = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('.interactive-node')) return; isDragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; el.style.cursor = 'grabbing'; };
        const handleMouseUp = () => { isDragging.current = false; el.style.cursor = 'grab'; };
        const handleMouseMove = (e: MouseEvent) => { if (!isDragging.current) return; const dx = e.clientX - lastPos.current.x; const dy = e.clientY - lastPos.current.y; setView(v => ({ ...v, x: v.x + dx, y: v.y + dy })); lastPos.current = { x: e.clientX, y: e.clientY }; };
        const handleWheel = (e: WheelEvent) => { e.preventDefault(); const scaleAmount = 1 - e.deltaY * 0.001; const rect = el.getBoundingClientRect(); const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top; setView(v => { const newK = Math.max(0.2, Math.min(2, v.k * scaleAmount)); const newX = v.x - (mouseX - v.x) * (newK / v.k - 1); const newY = v.y - (mouseY - v.y) * (newK / v.k - 1); return { x: newX, y: newY, k: newK }; }); };
        el.addEventListener('mousedown', handleMouseDown); window.addEventListener('mouseup', handleMouseUp); window.addEventListener('mousemove', handleMouseMove); el.addEventListener('wheel', handleWheel); el.style.cursor = 'grab';
        return () => { el.removeEventListener('mousedown', handleMouseDown); window.removeEventListener('mouseup', handleMouseUp); window.removeEventListener('mousemove', handleMouseMove); el.removeEventListener('wheel', handleWheel); };
    }, []);

    // Initial Center
    useEffect(() => { if(containerRef.current) { const { width, height } = containerRef.current.getBoundingClientRect(); setView(v => ({...v, x: width / 2, y: height / 2})); } }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#0B0F19]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            
            {/* Controls */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
                <div className="bg-gray-800 p-2 rounded-lg shadow-xl border border-gray-700">
                    <button onClick={() => setView(v => ({ ...v, k: Math.min(2, v.k * 1.2) }))} className="p-2 hover:bg-gray-700 rounded block"><ZoomInIcon className="w-6 h-6 text-gray-300"/></button>
                    <button onClick={() => setView(v => ({ ...v, k: Math.max(0.2, v.k / 1.2) }))} className="p-2 hover:bg-gray-700 rounded block"><ZoomOutIcon className="w-6 h-6 text-gray-300"/></button>
                    <button onClick={() => {const { width, height } = containerRef.current!.getBoundingClientRect(); setView({x: width/2, y: height/2, k: 0.5})}} className="p-2 hover:bg-gray-700 rounded block"><LocateIcon className="w-6 h-6 text-gray-300"/></button>
                </div>
            </div>

            {/* Canvas Layer */}
            <div className="absolute top-0 left-0 w-full h-full origin-top-left transition-transform duration-75 ease-linear"
                 style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}>
                
                {/* Lines Layer */}
                <svg className="absolute top-[-5000px] left-[-5000px] w-[10000px] h-[10000px] pointer-events-none overflow-visible">
                    <g transform="translate(5000, 5000)">
                        {/* Anchor Connections */}
                        {positionedHypotheses.map(h => (
                            <line key={`line-${h.id}`} x1={0} y1={0} x2={h.x} y2={h.y} stroke="#334155" strokeWidth="2" />
                        ))}
                        
                        {/* Similarity Radar Lines */}
                        {similarityLines.map((line, idx) => (
                            <line 
                                key={`sim-${idx}`} 
                                x1={line.x1} 
                                y1={line.y1} 
                                x2={line.x2} 
                                y2={line.y2} 
                                stroke="#ef4444" 
                                strokeWidth="4" 
                                strokeDasharray="10,10"
                                className="animate-pulse"
                            />
                        ))}
                    </g>
                </svg>

                {/* Central Anchor Node */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-slate-900 border-4 border-cyan-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] interactive-node z-10 text-center">
                    <h3 className="text-cyan-400 font-black uppercase tracking-widest text-lg mb-2">The Anchor</h3>
                    <div className="text-white font-bold text-2xl mb-2 line-clamp-2">"{goldenHook}"</div>
                    <div className="text-gray-400 text-sm">{productContext}</div>
                </div>

                {/* Similarity Warning Label */}
                {similarityLines.length > 0 && (
                    <div className="absolute top-[-100px] left-0 -translate-x-1/2 bg-red-900/80 text-red-200 px-4 py-2 rounded-full border border-red-500 flex items-center gap-2 animate-bounce whitespace-nowrap">
                        <ShieldAlertIcon className="w-5 h-5" />
                        High Similarity Detected! Diverge Strategy!
                    </div>
                )}

                {/* Hypothesis Nodes */}
                {positionedHypotheses.map(h => (
                    <div 
                        key={h.id} 
                        className="absolute interactive-node"
                        style={{ left: h.x, top: h.y, transform: 'translate(-50%, -50%)' }}
                    >
                        <div className="relative group">
                            {/* Cluster Duplication Button */}
                            <button 
                                onClick={() => onDuplicate(h)}
                                className="absolute -top-4 -right-12 bg-gray-700 hover:bg-green-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20"
                                title="Duplicate Cluster"
                            >
                                <CopyIcon className="w-5 h-5" />
                            </button>

                            <MobileFrame 
                                hypothesis={h} 
                                onRegenerate={() => onRegenerate(h.id)} 
                                onRoast={() => onRoast(h.id)}
                                onDelete={() => onDelete(h.id)}
                            />
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};
