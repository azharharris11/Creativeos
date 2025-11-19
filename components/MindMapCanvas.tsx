

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Hypothesis, MatrixSlot, OverlayConfig, RemixMode } from '../types';
import { ZoomInIcon, ZoomOutIcon, LocateIcon, CopyIcon, ShieldAlertIcon, EditIcon } from './icons';
import { MobileFrame } from './MobileFrame';
import { RemixModal } from './RemixModal';

export interface MindMapCanvasProps {
    hypotheses: Hypothesis[];
    productContext: string;
    goldenHook: string;
    onRegenerate: (id: string) => void;
    onRoast: (id: string) => void;
    onDuplicate: (hypothesis: Hypothesis) => void;
    onRemix: (mode: RemixMode, hypothesis: Hypothesis) => void;
    onUpdateHypothesis: (id: string, updates: Partial<Hypothesis>) => void;
    onDelete: (id: string) => void;
    onUpdateAnchor?: (newHook: string, updateOverlays: boolean) => void;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ 
    hypotheses, 
    productContext, 
    goldenHook, 
    onRegenerate, 
    onRoast, 
    onDuplicate, 
    onRemix,
    onUpdateHypothesis,
    onDelete,
    onUpdateAnchor
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState({ x: 0, y: 0, k: 0.4 }); // Start zoomed out to see clusters
    const [remixTarget, setRemixTarget] = useState<Hypothesis | null>(null);
    const isDragging = useRef(false);
    const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    
    // Anchor Editing State
    const [isEditingAnchor, setIsEditingAnchor] = useState(false);
    const [tempAnchorText, setTempAnchorText] = useState(goldenHook);

    useEffect(() => {
        setTempAnchorText(goldenHook);
    }, [goldenHook]);

    const handleAnchorSave = () => {
        setIsEditingAnchor(false);
        if (tempAnchorText !== goldenHook && onUpdateAnchor) {
            const shouldUpdate = window.confirm("Do you want to update this Hook across ALL existing hypotheses overlays?");
            onUpdateAnchor(tempAnchorText, shouldUpdate);
        }
    };

    // --- SMART CLUSTER LAYOUT ENGINE ---
    const positionedHypotheses = useMemo(() => {
        // 1. Group by Batch (Cluster)
        const clusters: Record<string, Hypothesis[]> = {};
        
        hypotheses.forEach(h => {
            // Extract batch ID (e.g., "abc1" from "abc1_A") or parentID
            let clusterId = h.parentId || h.slotId.split('_')[0]; 
            if (!clusters[clusterId]) clusters[clusterId] = [];
            clusters[clusterId].push(h);
        });

        const clusterKeys = Object.keys(clusters);
        const clusterRadius = 900; // Radius of the big ring of clusters
        const itemRadius = 350; // Radius of items around a cluster center
        
        const results: (Hypothesis & { x: number, y: number })[] = [];

        clusterKeys.forEach((cId, cIndex) => {
            // Calculate Cluster Center
            const cAngle = (cIndex / clusterKeys.length) * 2 * Math.PI;
            const cX = clusterKeys.length > 1 ? Math.cos(cAngle) * clusterRadius : 0;
            const cY = clusterKeys.length > 1 ? Math.sin(cAngle) * clusterRadius : 500; // Offset if single cluster

            // Position items around cluster center
            const items = clusters[cId];
            items.forEach((h, hIndex) => {
                const iAngle = (hIndex / items.length) * 2 * Math.PI;
                // Add slight offset based on index to prevent perfect overlaps in remixes
                const x = cX + Math.cos(iAngle) * itemRadius;
                const y = cY + Math.sin(iAngle) * itemRadius;
                results.push({ ...h, x, y });
            });
        });

        return results;
    }, [hypotheses]);

    // Lineage Lines (Parent -> Child)
    const lineageLines = useMemo(() => {
        const lines: { x1: number, y1: number, x2: number, y2: number }[] = [];
        const posMap = new Map(positionedHypotheses.map(h => [h.id, h]));

        positionedHypotheses.forEach(h => {
            if (h.parentId && posMap.has(h.parentId)) {
                const parent = posMap.get(h.parentId)!;
                lines.push({ x1: parent.x, y1: parent.y, x2: h.x, y2: h.y });
            }
        });
        return lines;
    }, [positionedHypotheses]);

    // Pan & Zoom Handlers
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handleMouseDown = (e: MouseEvent) => { 
            if ((e.target as HTMLElement).closest('.interactive-node')) return; 
            isDragging.current = true; 
            lastPos.current = { x: e.clientX, y: e.clientY }; 
            el.style.cursor = 'grabbing'; 
        };
        const handleMouseUp = () => { isDragging.current = false; el.style.cursor = 'grab'; };
        const handleMouseMove = (e: MouseEvent) => { 
            if (!isDragging.current) return; 
            const dx = e.clientX - lastPos.current.x; 
            const dy = e.clientY - lastPos.current.y; 
            setView(v => ({ ...v, x: v.x + dx, y: v.y + dy })); 
            lastPos.current = { x: e.clientX, y: e.clientY }; 
        };
        const handleWheel = (e: WheelEvent) => { 
            e.preventDefault(); 
            const scaleAmount = 1 - e.deltaY * 0.001; 
            // Zoom towards mouse pointer logic
            const rect = el.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            setView(v => { 
                const newK = Math.max(0.1, Math.min(2, v.k * scaleAmount));
                // Simple zoom center fix
                return { ...v, k: newK };
            }); 
        };
        el.addEventListener('mousedown', handleMouseDown); window.addEventListener('mouseup', handleMouseUp); window.addEventListener('mousemove', handleMouseMove); el.addEventListener('wheel', handleWheel); el.style.cursor = 'grab';
        return () => { el.removeEventListener('mousedown', handleMouseDown); window.removeEventListener('mouseup', handleMouseUp); window.removeEventListener('mousemove', handleMouseMove); el.removeEventListener('wheel', handleWheel); };
    }, []);

    useEffect(() => { if(containerRef.current) { const { width, height } = containerRef.current.getBoundingClientRect(); setView(v => ({...v, x: width / 2, y: height / 2})); } }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#0B0F19]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            
            {/* Controls */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
                <div className="bg-gray-800 p-2 rounded-lg shadow-xl border border-gray-700">
                    <button onClick={() => setView(v => ({ ...v, k: Math.min(2, v.k * 1.2) }))} className="p-2 hover:bg-gray-700 rounded block"><ZoomInIcon className="w-6 h-6 text-gray-300"/></button>
                    <button onClick={() => setView(v => ({ ...v, k: Math.max(0.1, v.k / 1.2) }))} className="p-2 hover:bg-gray-700 rounded block"><ZoomOutIcon className="w-6 h-6 text-gray-300"/></button>
                    <button onClick={() => {const { width, height } = containerRef.current!.getBoundingClientRect(); setView({x: width/2, y: height/2, k: 0.4})}} className="p-2 hover:bg-gray-700 rounded block"><LocateIcon className="w-6 h-6 text-gray-300"/></button>
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
                            <line key={`line-${h.id}`} x1={0} y1={0} x2={h.x} y2={h.y} stroke="#334155" strokeWidth="2" opacity="0.5" />
                        ))}
                        
                        {/* Lineage Lines (Parent -> Child) */}
                        {lineageLines.map((line, idx) => (
                            <line 
                                key={`lin-${idx}`} 
                                x1={line.x1} 
                                y1={line.y1} 
                                x2={line.x2} 
                                y2={line.y2} 
                                stroke="#22d3ee" 
                                strokeWidth="4" 
                                strokeDasharray="5,5"
                                className="opacity-60"
                            />
                        ))}
                    </g>
                </svg>

                {/* Central Anchor Node (Editable Master Switch) */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-slate-900 border-4 border-cyan-500 rounded-2xl p-6 shadow-[0_0_80px_rgba(6,182,212,0.4)] interactive-node z-10 text-center group">
                    <h3 className="text-cyan-400 font-black uppercase tracking-widest text-lg mb-2">The Anchor (Master)</h3>
                    
                    {isEditingAnchor ? (
                        <div className="flex flex-col gap-2">
                            <textarea 
                                value={tempAnchorText}
                                onChange={(e) => setTempAnchorText(e.target.value)}
                                className="bg-black text-white p-2 rounded border border-cyan-700 w-full text-xl font-bold text-center"
                                rows={2}
                            />
                            <div className="flex gap-2 justify-center">
                                <button onClick={() => setIsEditingAnchor(false)} className="px-3 py-1 text-sm text-gray-400 hover:text-white">Cancel</button>
                                <button onClick={handleAnchorSave} className="px-3 py-1 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-500 font-bold">Save & Propagate</button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="text-white font-bold text-2xl mb-2 line-clamp-2">"{goldenHook}"</div>
                            <button 
                                onClick={() => setIsEditingAnchor(true)}
                                className="absolute -right-8 top-0 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    
                    <div className="text-gray-400 text-sm mt-2">{productContext}</div>
                </div>

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
                                onRemix={() => setRemixTarget(h)}
                                onUpdateOverlay={(config) => onUpdateHypothesis(h.id, { overlay: config })}
                                scale={view.k} // Pass zoom level for optimization
                            />
                        </div>
                    </div>
                ))}
            </div>

             {remixTarget && (
                <RemixModal 
                    hypothesis={remixTarget} 
                    onClose={() => setRemixTarget(null)} 
                    onConfirm={(mode) => {
                        onRemix(mode, remixTarget);
                        setRemixTarget(null);
                    }} 
                />
            )}
        </div>
    );
};
