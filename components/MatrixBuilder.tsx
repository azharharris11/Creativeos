
import React, { useState, useEffect } from 'react';
import { MatrixSlot, MATRIX_DEFAULTS, MatrixVar_Format, MatrixSlot as SlotType } from '../types';
import { ShieldAlertIcon, ZapIcon, DiceIcon, InfoIcon } from './icons';

interface MatrixBuilderProps {
    onGenerate: (config: Record<'A' | 'B' | 'C', MatrixSlot>) => void;
}

const SELECT_OPTIONS = {
    format: [
        'Big_Font_Impact', 
        'Gmail_Letter_UX', 
        'Billboard_Context', 
        'Long_Text_Story', 
        'Ugly_Problem_Visual', 
        'MS_Paint_Nostalgia', 
        'Instagram_Story_UX', 
        'Reddit_Thread_UX',
        'Handwritten_Whiteboard',
        'Meme_Format',
        'CCTV_Security_Footage',
        'Direct_Flash_Selfie',
        'Cartoonic_Graphic'
    ],
    setting: [
        'Messy_Bedroom', 
        'Bathroom_Mirror_Dirty', 
        'Car_Dashboard_Traffic', 
        'Supermarket_Aisle',
        'Street_Pavement',
        'Kitchen_Table_Cluttered',
        'Blank_Wall_Background',
        'Computer_Screen_Macro'
    ],
    lighting: [
        'Harsh_Flash_ON', 
        'Bad_Fluorescent_Office', 
        'Dim_Bedroom_Lamp', 
        'Overexposed_Sunlight', 
        'Screen_Glow_Blue',
        'Flat_Digital_NoShadow'
    ],
    persona: ['Gen_Z_Real', 'Stressed_Parent', 'Skeptical_User', 'Blue_Collar_Worker', 'Anonymous_Poster'],
    pov: ['Selfie_Bad_Angle', 'First_Person_Shaky', 'Screen_Screenshot', 'Security_Cam_TopDown', 'Street_Level_Wide', 'Macro_Texture'],
    action: ['Showing_Problem_CloseUp', 'Unboxing_Messy', 'Pointing_Finger', 'Holding_Product_Awkwardly', 'Just_Text_No_Action'],
    tone: ['Brutally_Honest', 'Urgent_Warning', 'Confused_Skeptical', 'Manic_Energy', 'Deadpan_Humor']
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

    const handleRandomizeChaos = () => {
        const newSlots = { ...slots };
        
        const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        // Helper to randomize a slot (excluding ID) with collision detection
        const randomizeSlot = (slotId: 'B' | 'C', comparisons: ('A' | 'B')[]) => {
            let safe = false;
            let attempts = 0;
            
            // @ts-ignore
            let candidate: any = {};

            while (!safe && attempts < 20) {
                candidate = {
                    ...newSlots[slotId],
                    format: getRandom(SELECT_OPTIONS.format),
                    setting: getRandom(SELECT_OPTIONS.setting),
                    lighting: getRandom(SELECT_OPTIONS.lighting),
                    persona: getRandom(SELECT_OPTIONS.persona),
                    pov: getRandom(SELECT_OPTIONS.pov),
                    action: getRandom(SELECT_OPTIONS.action),
                    tone: getRandom(SELECT_OPTIONS.tone),
                };

                // Check collisions against comparison slots
                let collisions = 0;
                comparisons.forEach(comp => {
                    if (candidate.format === newSlots[comp].format) collisions++;
                    if (candidate.setting === newSlots[comp].setting) collisions++;
                });
                
                if (collisions === 0) safe = true;
                attempts++;
            }
            
            // @ts-ignore
            newSlots[slotId] = candidate;
        };

        // Slot A stays effectively as is (Anchor) or could be randomized if needed. 
        // Here we keep A stable and chaotic B and C around it.
        
        randomizeSlot('B', ['A']);
        randomizeSlot('C', ['A', 'B']);
        
        setSlots(newSlots);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-200">Phase 2: The Divergence Matrix</h2>
                <p className="text-slate-400">Configure 3 radically different visual vehicles using the <span className="text-red-400 font-bold">13 Proven Ugly Formats</span>. <br/> <span className="text-red-400 font-bold uppercase">Do not make them pretty. Make them Convert.</span></p>
            </header>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                 <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg flex items-start gap-3 max-w-2xl">
                    <InfoIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-200">
                        <strong className="block text-blue-300 mb-1">The "Ugly Ads" Philosophy:</strong>
                        Pretty ads get ignored. We use "Pattern Interrupts" like <span className="text-white font-mono bg-blue-900/50 px-1 rounded">MS_Paint</span>, <span className="text-white font-mono bg-blue-900/50 px-1 rounded">Notes_App</span>, or <span className="text-white font-mono bg-blue-900/50 px-1 rounded">Messy_Rooms</span> to signal Authenticity and bypass mental ad filters.
                    </div>
                 </div>

                 <button 
                    onClick={handleRandomizeChaos}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-purple-300 px-4 py-2 rounded-lg border border-purple-500/30 transition-colors text-sm font-bold uppercase tracking-wider whitespace-nowrap"
                >
                    <DiceIcon className="w-5 h-5" />
                    Inject Random Chaos
                </button>
            </div>

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
                    disabled={conflictScore > 5}
                    className={`
                        bg-green-600 text-white font-black text-xl py-4 px-16 rounded-lg shadow-[0_0_30px_rgba(22,163,74,0.4)] 
                        transition-all transform flex items-center gap-3 uppercase tracking-widest
                        ${conflictScore > 5 
                            ? 'opacity-50 cursor-not-allowed grayscale bg-red-900' 
                            : 'hover:bg-green-500 hover:shadow-[0_0_50px_rgba(22,163,74,0.6)] hover:scale-105'}
                    `}
                >
                    <ZapIcon className="w-6 h-6" />
                    {conflictScore > 5 ? 'Fix Similarity First' : 'Generate "Ugly" Concepts'}
                </button>
            </div>
        </div>
    );
};
