
import React from 'react';
import { Hypothesis } from '../types';
import { MobileFrame } from './MobileFrame';

interface RealitySimulatorProps {
    hypotheses: Hypothesis[];
    onRegenerate: (id: string) => void;
    onRoast: (id: string) => void;
}

export const RealitySimulator: React.FC<RealitySimulatorProps> = ({ hypotheses, onRegenerate, onRoast }) => {
    return (
        <div className="w-full p-8">
            <header className="mb-10 text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-200">Phase 3: Reality Simulator</h2>
                <p className="text-slate-400">Validate against native environments. Check for safe zones.</p>
            </header>
            
            <div className="flex flex-wrap justify-center gap-10">
                {hypotheses.map(h => (
                    <MobileFrame 
                        key={h.id} 
                        hypothesis={h} 
                        onRegenerate={() => onRegenerate(h.id)} 
                        onRoast={() => onRoast(h.id)}
                    />
                ))}
            </div>
        </div>
    );
};
