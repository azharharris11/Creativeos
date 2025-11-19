
import React, { useState } from 'react';
import { Hypothesis, OverlayConfig } from '../types';
import { MobileFrame } from './MobileFrame';
import { RemixModal } from './RemixModal';
import { DownloadIcon, RefreshCwIcon } from './icons';
import { exportHypothesesToZip } from '../services/exportService';

interface RealitySimulatorProps {
    hypotheses: Hypothesis[];
    onRegenerate: (id: string) => void;
    onRoast: (id: string) => void;
    onRemix: (mode: 'scale_vibe' | 'scale_visual', hypothesis: Hypothesis) => void;
    onUpdateHypothesis: (id: string, updates: Partial<Hypothesis>) => void;
}

export const RealitySimulator: React.FC<RealitySimulatorProps> = ({ hypotheses, onRegenerate, onRoast, onRemix, onUpdateHypothesis }) => {
    const [remixTarget, setRemixTarget] = useState<Hypothesis | null>(null);
    const [isExportingAll, setIsExportingAll] = useState(false);

    const handleExportAll = async () => {
        setIsExportingAll(true);
        try {
            await exportHypothesesToZip(hypotheses, "My_Campaign");
        } catch (e) {
            console.error("Export failed", e);
            alert("Export failed. Make sure visuals are generated.");
        } finally {
            setIsExportingAll(false);
        }
    };

    const handleUpdateOverlay = (id: string, overlay: OverlayConfig) => {
        onUpdateHypothesis(id, { overlay });
    };

    return (
        <div className="w-full p-8">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-200">Phase 3: Reality Simulator</h2>
                    <p className="text-slate-400">Validate against native environments. Edit overlays. Scale winners.</p>
                </div>
                <button 
                    onClick={handleExportAll}
                    disabled={isExportingAll}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                    {isExportingAll ? <RefreshCwIcon className="w-5 h-5 animate-spin"/> : <DownloadIcon className="w-5 h-5"/>}
                    Export All to Ads Manager
                </button>
            </header>
            
            <div className="flex flex-wrap justify-center gap-10">
                {hypotheses.map(h => (
                    <MobileFrame 
                        key={h.id} 
                        hypothesis={h} 
                        onRegenerate={() => onRegenerate(h.id)} 
                        onRoast={() => onRoast(h.id)}
                        onRemix={() => setRemixTarget(h)}
                        onUpdateOverlay={(config) => handleUpdateOverlay(h.id, config)}
                    />
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
