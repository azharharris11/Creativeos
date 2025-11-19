
import React, { useState, useEffect } from 'react';
import { MatrixSlot, MATRIX_DEFAULTS, MatrixVar_Format, AspectRatio, MatrixVar_Setting, MatrixVar_Lighting } from '../types';
import { ShieldAlertIcon, ZapIcon, DiceIcon, InfoIcon, PackageIcon } from './icons';

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

// Helper to add visual cues to text formats
const getFormatIcon = (format: string) => {
    if (format.includes('Story') || format.includes('Instagram')) return '📱';
    if (format.includes('Bill')) return '🛣️';
    if (format.includes('Paint') || format.includes('Cartoon')) return '🎨';
    if (format.includes('Gmail') || format.includes('Text') || format.includes('Reddit')) return '📝';
    if (format.includes('CCTV')) return '📹';
    if (format.includes('Flash')) return '📸';
    if (format.includes('Impact')) return '💥';
    if (format.includes('Whiteboard')) return '🖊️';
    return '🖼️';
};

// --- SMART CHAOS ENGINE: COMPATIBILITY RULES ---
// This ensures random generation doesn't create impossible visuals (e.g. CCTV in a Macro Screen)

const getCompatibleSettings = (format: string): string[] => {
    switch(format) {
        case 'Gmail_Letter_UX':
        case 'Reddit_Thread_UX':
        case 'Long_Text_Story':
            return ['Computer_Screen_Macro', 'Blank_Wall_Background'];
        case 'Billboard_Context':
            return ['Street_Pavement', 'Car_Dashboard_Traffic'];
        case 'CCTV_Security_Footage':
            return ['Supermarket_Aisle', 'Street_Pavement', 'Car_Dashboard_Traffic'];
        case 'Instagram_Story_UX':
        case 'Direct_Flash_Selfie':
            return ['Messy_Bedroom', 'Bathroom_Mirror_Dirty', 'Kitchen_Table_Cluttered', 'Car_Dashboard_Traffic'];
        case 'Handwritten_Whiteboard':
             return ['Blank_Wall_Background', 'Messy_Bedroom']; // Home office vibe
        default:
            return SELECT_OPTIONS.setting;
    }
};

const getCompatibleLighting = (setting: string, format: string): string[] => {
    // Format overrides
    if (format === 'Direct_Flash_Selfie') return ['Harsh_Flash_ON'];
    if (format === 'CCTV_Security_Footage') return ['Flat_Digital_NoShadow', 'Bad_Fluorescent_Office'];
    if (format.includes('_UX')) return ['Screen_Glow_Blue', 'Flat_Digital_NoShadow'];

    // Setting overrides
    if (setting === 'Computer_Screen_Macro') return ['Screen_Glow_Blue'];
    if (setting === 'Overexposed_Sunlight' || setting === 'Street_Pavement') return ['Overexposed_Sunlight'];
    if (setting.includes('Bedroom')) return ['Dim_Bedroom_Lamp', 'Harsh_Flash_ON'];
    if (setting === 'Bathroom_Mirror_Dirty') return ['Harsh_Flash_ON', 'Bad_Fluorescent_Office'];

    return SELECT_OPTIONS.lighting;
};

const getCompatiblePOV = (format: string): string[] => {
    if (format === 'CCTV_Security_Footage') return ['Security_Cam_TopDown'];
    if (format.includes('_UX')) return ['Screen_Screenshot'];
    if (format === 'Direct_Flash_Selfie') return ['Selfie_Bad_Angle'];
    if (format === 'Billboard_Context') return ['Street_Level_Wide', 'First_Person_Shaky'];
    return SELECT_OPTIONS.pov;
}

export const MatrixBuilder: React.FC<MatrixBuilderProps> = ({ onGenerate }) => {
    const [slots, setSlots] = useState(MATRIX_DEFAULTS);
    const [conflictScore, setConflictScore] = useState(0);
    const [globalAspectRatio, setGlobalAspectRatio] = useState<AspectRatio>('9:16');

    // Calculate similarity score to warn user
    useEffect(() => {
        let score = 0;
        const keys = Object.keys(slots.A) as (keyof MatrixSlot)[];
        // Simple heuristic: check exact matches
        keys.forEach(k => { if (k !== 'id' && slots.A[k] === slots.B[k]) score++; });
        keys.forEach(k => { if (k !== 'id' && slots.B[k] === slots.C[k]) score++; });
        keys.forEach(k => { if (k !== 'id' && slots.A[k] === slots.C[k]) score++; });
        setConflictScore(score);
    }, [slots]);

    // Sync Aspect Ratio to all slots when global selector changes
    useEffect(() => {
        setSlots(prev => ({
            A: { ...prev.A, aspectRatio: globalAspectRatio },
            B: { ...prev.B, aspectRatio: globalAspectRatio },
            C: { ...prev.C, aspectRatio: globalAspectRatio }
        }));
    }, [globalAspectRatio]);

    // --- COMPATIBILITY ENFORCER ---
    // Automatically corrects Setting/Lighting if the User picks a format that demands a specific environment
    useEffect(() => {
        const enforceRules = (id: 'A' | 'B' | 'C') => {
            const format = slots[id].format;
            
            // Rule 1: Digital UI formats must be on a Screen or Blank Wall
            if (['Gmail_Letter_UX', 'Long_Text_Story', 'Reddit_Thread_UX'].includes(format)) {
                if (slots[id].setting !== 'Computer_Screen_Macro' && slots[id].setting !== 'Blank_Wall_Background') {
                    setSlots(prev => ({ ...prev, [id]: { ...prev[id], setting: 'Computer_Screen_Macro', lighting: 'Flat_Digital_NoShadow', pov: 'Screen_Screenshot' } }));
                }
            }

            // Rule 2: Big Font Impact needs Blank Wall
            if (format === 'Big_Font_Impact') {
                if (slots[id].setting !== 'Blank_Wall_Background') {
                    setSlots(prev => ({ ...prev, [id]: { ...prev[id], setting: 'Blank_Wall_Background', lighting: 'Flat_Digital_NoShadow', pov: 'Macro_Texture' } }));
                }
            }
        };

        enforceRules('A');
        enforceRules('B');
        enforceRules('C');
    }, [slots.A.format, slots.B.format, slots.C.format]);

    const handleChange = (slotId: 'A' | 'B' | 'C', field: keyof MatrixSlot, value: string) => {
        setSlots(prev => ({
            ...prev,
            [slotId]: { ...prev[slotId], [field]: value }
        }));
    };

    const handleRandomizeChaos = () => {
        const newSlots = { ...slots };
        const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        const randomizeSlot = (slotId: 'B' | 'C', comparisons: ('A' | 'B')[]) => {
            let safe = false;
            let attempts = 0;
            // @ts-ignore
            let candidate: MatrixSlot = {};

            while (!safe && attempts < 20) {
                // 1. Pick Format First (This drives the rest)
                const format = getRandom(SELECT_OPTIONS.format);
                
                // 2. Pick Compatible Setting
                const validSettings = getCompatibleSettings(format);
                const setting = getRandom(validSettings);
                
                // 3. Pick Compatible Lighting
                const validLighting = getCompatibleLighting(setting, format);
                const lighting = getRandom(validLighting);

                // 4. Pick Compatible POV
                const validPOV = getCompatiblePOV(format);
                const pov = getRandom(validPOV);

                candidate = {
                    id: slotId,
                    format,
                    setting,
                    lighting,
                    pov,
                    persona: getRandom(SELECT_OPTIONS.persona),
                    action: getRandom(SELECT_OPTIONS.action),
                    tone: getRandom(SELECT_OPTIONS.tone),
                    aspectRatio: globalAspectRatio
                };

                // 5. Check for collisions with previous slots
                let collisions = 0;
                comparisons.forEach(comp => {
                    if (candidate.format === newSlots[comp].format) collisions++;
                });
                
                if (collisions === 0) safe = true;
                attempts++;
            }
            
            newSlots[slotId] = candidate;
        };
        
        // Keep A locked (User Control), Randomize B and C
        randomizeSlot('B', ['A']);
        randomizeSlot('C', ['A', 'B']);
        
        setSlots(newSlots);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-200">Phase 2: The Divergence Matrix</h2>
                <p className="text-slate-400">Configure 3 radically different visual vehicles. <span className="text-red-400 font-bold uppercase">Make them Ugly. Make them Convert.</span></p>
            </header>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                 <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg flex items-center gap-3">
                    <InfoIcon className="w-5 h-5 text-blue-400" />
                    <div className="text-sm text-blue-200 flex items-center gap-2">
                         <strong>Output Ratio:</strong>
                         <select 
                            value={globalAspectRatio} 
                            onChange={(e) => setGlobalAspectRatio(e.target.value as AspectRatio)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                         >
                             <option value="9:16">9:16 (Story/Reels)</option>
                             <option value="4:5">4:5 (Portrait Feed)</option>
                             <option value="1:1">1:1 (Square)</option>
                         </select>
                    </div>
                 </div>

                 <button 
                    onClick={handleRandomizeChaos}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-purple-300 px-4 py-2 rounded-lg border border-purple-500/30 transition-colors text-sm font-bold uppercase tracking-wider whitespace-nowrap"
                >
                    <DiceIcon className="w-5 h-5" />
                    Inject Smart Chaos
                </button>
            </div>

            {conflictScore > 5 && (
                <div className="mb-6 bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg flex items-center justify-center gap-3 animate-pulse">
                    <ShieldAlertIcon className="w-6 h-6" />
                    <span className="font-bold">SIMILARITY ALERT: Your slots are too similar. Hit Chaos button!</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {(['A', 'B', 'C'] as const).map(id => (
                    <div key={id} className={`relative p-6 rounded-xl border-2 ${SLOT_COLORS[id]} backdrop-blur-sm transition-all hover:border-opacity-100 border-opacity-60`}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 px-4 py-1 rounded-full border border-gray-700 text-xl font-black text-white shadow-xl z-10">
                            SLOT {id}
                        </div>
                        
                        <div className="space-y-4 mt-4">
                            {Object.entries(SELECT_OPTIONS).map(([key, options]) => (
                                <div key={key}>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{key}</label>
                                    <select 
                                        value={slots[id][key as keyof MatrixSlot]}
                                        onChange={(e) => handleChange(id, key as keyof MatrixSlot, e.target.value)}
                                        className="w-full bg-gray-900/80 border border-gray-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-white outline-none truncate"
                                    >
                                        {options.map(opt => (
                                            <option key={opt} value={opt}>
                                                {key === 'format' ? getFormatIcon(opt) : ''} {opt.replace(/_/g, ' ')}
                                            </option>
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
                    className={`
                        bg-green-600 text-white font-black text-xl py-4 px-16 rounded-lg shadow-[0_0_30px_rgba(22,163,74,0.4)] 
                        transition-all transform flex items-center gap-3 uppercase tracking-widest
                        hover:bg-green-500 hover:shadow-[0_0_50px_rgba(22,163,74,0.6)] hover:scale-105
                    `}
                >
                    <ZapIcon className="w-6 h-6" />
                    Generate "Ugly" Concepts
                </button>
            </div>
        </div>
    );
};
