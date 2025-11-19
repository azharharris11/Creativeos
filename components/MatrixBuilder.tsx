
import React, { useState, useEffect } from 'react';
import { MatrixSlot, MATRIX_DEFAULTS, MatrixVar_Format, MatrixVar_Setting, MatrixVar_Lighting, MatrixVar_Persona, MatrixVar_POV, MatrixVar_Action, MatrixVar_Tone } from '../types';
import { ShieldAlertIcon, ZapIcon } from './icons';

interface MatrixBuilderProps {
    onGenerate: (config: Record<'A' | 'B' | 'C', MatrixSlot>) => void;
}

const SELECT_OPTIONS = {
    format: ['UGC_Raw', 'Editorial_Pro', 'CCTV_Surveillance', 'Meme_Chaotic'],
    setting: ['Private_Indoor', 'Public_Indoor', 'Nature_Outdoor', 'Urban_Outdoor', 'Abstract_Studio'],
    lighting: ['Golden_Hour', 'Night_Flash', 'Neon_RGB', 'Natural_Window', 'Office_Fluorescent'],
    persona: ['Gen_Z_User', 'Mom_Dad_User', 'Expert_Doctor', 'Worker_BlueCollar', 'Hand_Only'],
    pov: ['Selfie', 'First_Person', 'Third_Person', 'CCTV_High_Angle'],
    action: ['Applying_Product', 'Shock_Reaction', 'Struggle_Pain', 'Result_Flexing'],
    tone: ['Urgent_Panic', 'Skeptical', 'Happy_Relieved', 'Serious_Scientific']
};

const SLOT_COLORS = {
    A: 'border-cyan-500/30 bg-cyan-950/10',
    B: 'border-purple-500/30 bg-purple-950/10',
    C: 'border-yellow-500/30 bg-yellow-950/10'
};

export const MatrixBuilder: React.FC<MatrixBuilderProps> = ({ onGenerate }) => {
    const [slots, setSlots] = useState(MATRIX_DEFAULTS);
    const [conflictScore, setConflictScore] = useState(0);

    // Calculate similarity score to prevent Entity ID grouping
    useEffect(() => {
        let score = 0;
        const keys = Object.keys(slots.A) as (keyof MatrixSlot)[];
        // Compare A vs B
        keys.forEach(k => { if (k !== 'id' && slots.A[k] === slots.B[k]) score++; });
        // Compare B vs C
        keys.forEach(k => { if (k !== 'id' && slots.B[k] === slots.C[k]) score++; });
        // Compare A vs C
        keys.forEach(k => { if (k !== 'id' && slots.A[k] === slots.C[k]) score++; });
        
        setConflictScore(score);
    }, [slots]);

    const handleChange = (slotId: 'A' | 'B' | 'C', field: keyof MatrixSlot, value: string) => {
        setSlots(prev => ({
            ...prev,
            [slotId]: { ...prev[slotId], [field]: value }
        }));
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-200">Phase 2: The Divergence Matrix</h2>
                <p className="text-slate-400">Configure 3 radically different visual vehicles. <br/> <span className="text-red-400">Warning: High similarity triggers Algorithmic Penalty.</span></p>
            </header>

            {conflictScore > 5 && (
                <div className="mb-6 bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg flex items-center justify-center gap-3 animate-pulse">
                    <ShieldAlertIcon className="w-6 h-6" />
                    <span className="font-bold">SIMILARITY ALERT: Your slots are too similar. Change formats or lighting to break Entity ID.</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['A', 'B', 'C'] as const).map(id => (
                    <div key={id} className={`relative p-6 rounded-xl border-2 ${SLOT_COLORS[id]} backdrop-blur-sm transition-all`}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 px-4 py-1 rounded-full border border-gray-700 text-xl font-black text-white shadow-xl">
                            SLOT {id}
                        </div>
                        
                        <div className="space-y-4 mt-4">
                            {Object.entries(SELECT_OPTIONS).map(([key, options]) => (
                                <div key={key}>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{key}</label>
                                    <select 
                                        value={slots[id][key as keyof MatrixSlot]}
                                        onChange={(e) => handleChange(id, key as keyof MatrixSlot, e.target.value)}
                                        className="w-full bg-gray-900/80 border border-gray-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-white outline-none"
                                    >
                                        {options.map(opt => (
                                            <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex justify-center">
                <button 
                    onClick={() => onGenerate(slots)}
                    className="bg-green-600 hover:bg-green-500 text-white font-black text-xl py-4 px-16 rounded-lg shadow-[0_0_30px_rgba(22,163,74,0.4)] hover:shadow-[0_0_50px_rgba(22,163,74,0.6)] transition-all transform hover:scale-105 flex items-center gap-3 uppercase tracking-widest"
                >
                    <ZapIcon className="w-6 h-6" />
                    Execute Uglifier Engine
                </button>
            </div>
        </div>
    );
};
