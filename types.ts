
export type ViewMode = 'linear' | 'canvas' | 'dashboard' | 'mindmap';

export interface TargetPersona {
  description: string;
  painPoints: string[];
  desiredOutcomes: string[];
  age: string;
  creatorType: string;
}

export type TargetCountry = 'Indonesia' | 'USA' | 'UK' | 'Brazil' | 'India' | 'Germany' | 'Global';

export interface CampaignBlueprint {
  brandName: string; // NEW: For UI Overlay
  visualReference?: string; // NEW: Base64 of product image for Multimodal Prompting
  productAnalysis: {
    name: string;
    keyBenefit: string;
  };
  targetPersona: TargetPersona;
  adDna: {
    salesMechanism: string;
    copyPattern: string;
    persuasionFormula: string;
    specificLanguagePatterns: string[];
    toneOfVoice: string;
    socialProofElements: string;
    objectionHandling: string;
    visualStyle: string;
    targetCountry: TargetCountry | string;
    offerSummary: string;
    cta: string;
  };
}

// --- MATRIX ENGINE TYPES (UPDATED FOR UGLY ADS PHILOSOPHY) ---

export type MatrixVar_Format = 
  'Big_Font_Impact' | 
  'Gmail_Letter_UX' | 
  'Billboard_Context' | 
  'Long_Text_Story' | // Notes App style
  'Ugly_Problem_Visual' | 
  'MS_Paint_Nostalgia' | 
  'Instagram_Story_UX' | 
  'Cartoonic_Graphic' |
  'Reddit_Thread_UX' |
  'Handwritten_Whiteboard' |
  'Meme_Format' |
  'CCTV_Security_Footage' |
  'Direct_Flash_Selfie';

export type MatrixVar_Setting = 
  'Messy_Bedroom' | 
  'Bathroom_Mirror_Dirty' | 
  'Car_Dashboard_Traffic' | 
  'Supermarket_Aisle' |
  'Street_Pavement' |
  'Kitchen_Table_Cluttered' |
  'Computer_Screen_Macro' |
  'Blank_Wall_Background';

export type MatrixVar_Lighting = 
  'Harsh_Flash_ON' | 
  'Bad_Fluorescent_Office' | 
  'Dim_Bedroom_Lamp' | 
  'Overexposed_Sunlight' | 
  'Screen_Glow_Blue' |
  'Flat_Digital_NoShadow';

export type MatrixVar_Persona = 'Gen_Z_Real' | 'Stressed_Parent' | 'Skeptical_User' | 'Blue_Collar_Worker' | 'Anonymous_Poster';
export type MatrixVar_POV = 'Selfie_Bad_Angle' | 'First_Person_Shaky' | 'Screen_Screenshot' | 'Security_Cam_TopDown' | 'Street_Level_Wide' | 'Macro_Texture';
export type MatrixVar_Action = 'Showing_Problem_CloseUp' | 'Unboxing_Messy' | 'Pointing_Finger' | 'Holding_Product_Awkwardly' | 'Just_Text_No_Action';
export type MatrixVar_Tone = 'Brutally_Honest' | 'Urgent_Warning' | 'Confused_Skeptical' | 'Manic_Energy' | 'Deadpan_Humor';

export type AspectRatio = '9:16' | '1:1' | '4:5';

export interface MatrixSlot {
  id: 'A' | 'B' | 'C' | string; 
  format: MatrixVar_Format | string;
  setting: MatrixVar_Setting | string;
  lighting: MatrixVar_Lighting | string;
  persona: MatrixVar_Persona | string;
  pov: MatrixVar_POV | string;
  action: MatrixVar_Action | string;
  tone: MatrixVar_Tone | string;
  aspectRatio?: AspectRatio; // NEW: Ratio control
}

export const MATRIX_DEFAULTS: Record<'A' | 'B' | 'C', MatrixSlot> = {
  A: { id: 'A', format: 'Ugly_Problem_Visual', setting: 'Messy_Bedroom', lighting: 'Harsh_Flash_ON', persona: 'Gen_Z_Real', pov: 'Selfie_Bad_Angle', action: 'Showing_Problem_CloseUp', tone: 'Brutally_Honest', aspectRatio: '9:16' },
  B: { id: 'B', format: 'Long_Text_Story', setting: 'Blank_Wall_Background', lighting: 'Screen_Glow_Blue', persona: 'Anonymous_Poster', pov: 'Screen_Screenshot', action: 'Just_Text_No_Action', tone: 'Urgent_Warning', aspectRatio: '9:16' },
  C: { id: 'C', format: 'Billboard_Context', setting: 'Street_Pavement', lighting: 'Overexposed_Sunlight', persona: 'Blue_Collar_Worker', pov: 'Street_Level_Wide', action: 'Holding_Product_Awkwardly', tone: 'Deadpan_Humor', aspectRatio: '9:16' }
};

// --- OVERLAY & REMIX TYPES ---

export type OverlayStyle = 'IG_Story' | 'TikTok_Modern' | 'Meme_Impact' | 'Plain_Text' | 'Notion_Header' | 'Handwritten_Marker';

export interface OverlayConfig {
    enabled: boolean;
    text: string;
    style: OverlayStyle; // Presets
    yPosition: number; // 0-100 percentage
    
    // Advanced Styling
    color?: string;
    backgroundColor?: string; // 'transparent' or hex
    fontSize?: number; // 10-100
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
}

export type RemixMode = 'scale_vibe' | 'scale_visual';

export type GenerationStatus = 'idle' | 'prompting' | 'rendering' | 'roasting' | 'completed' | 'failed';

export interface Hypothesis {
  id: string;
  slotId: string;
  matrixConfig: MatrixSlot;
  hook: string; // The Golden Hook (Locked)
  visualPrompt: string;
  imageUrl?: string;
  isGenerating: boolean;
  generationStatus?: GenerationStatus; // NEW: Granular status
  brandName?: string; // NEW: Passed for UI overlay
  aiRoast?: {
    vibe: string;
    targetAudience: string;
    thumbstopScore: number; // 0-100
    critique: string;
  };
  overlay?: OverlayConfig;
  parentId?: string; // Track lineage for remixes
  error?: string;
}

export type AppStep = 'landing' | 'anchor' | 'validateBlueprint' | 'matrix' | 'reality' | 'input' | 'dashboard';

// --- CAMPAIGN & MINDMAP TYPES ---

export type AwarenessStage = 'Problem Aware' | 'Solution Aware' | 'Product Aware' | 'Most Aware' | 'Unaware';
export const ALL_AWARENESS_STAGES: AwarenessStage[] = ['Problem Aware', 'Solution Aware', 'Product Aware', 'Most Aware', 'Unaware'];

export type CreativeFormat = string;
export const ALL_CREATIVE_FORMATS: string[] = [
    'Big_Font_Impact', 
    'Gmail_Letter_UX', 
    'Billboard_Context', 
    'Long_Text_Story', 
    'Ugly_Problem_Visual', 
    'MS_Paint_Nostalgia', 
    'Instagram_Story_UX', 
    'Reddit_Thread_UX',
    'Handwritten_Whiteboard'
];

export type PlacementFormat = 'Feed' | 'Story' | 'Reels' | 'Search';

export interface BuyingTriggerObject {
    name: string;
    example?: string;
}

export interface OfferTypeObject {
    name: string;
}

export interface CarouselSlide {
    slideNumber: number;
    hook: string;
    headline: string;
    description: string;
    visualPrompt: string;
}

export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    color: string;
    top: number;
    left: number;
    width: number;
    textAlign: 'left' | 'center' | 'right';
    textShadow: string;
    lineHeight: number;
}

export interface AdConcept {
  id: string;
  adSetName: string;
  campaignTag?: string; // Batch tag
  personaDescription: string;
  strategicPathId?: string; // Node ID from mindmap
  
  angle: string;
  trigger: BuyingTriggerObject;
  format: string; // CreativeFormat
  placement: string; // PlacementFormat
  entryPoint: 'Emotional' | 'Logical' | 'Social' | 'Evolved' | 'Pivoted' | 'Remixed';
  
  hook: string;
  headline: string;
  visualPrompt: string;
  
  imageUrls?: string[];
  isGenerating?: boolean;
  error?: string;
  
  // Carousel specifics
  carouselSlides?: CarouselSlide[];
  carouselArc?: string;
  
  // Styles
  headlineStyle?: TextStyle;
  textOverlayStyle?: TextStyle;
  
  performanceData?: {
      status: 'Winner' | 'Testing' | 'Failed' | 'Pending';
      ctr?: number;
      cpc?: number;
      roas?: number;
  };
  
  copyQualityValidation?: {
      valid: boolean;
      feedback: string;
  };
  triggerImplementationValidation?: {
      valid: boolean;
      feedback: string;
  };
}

export interface MindMapNode {
  id: string;
  type: 'dna' | 'persona' | 'angle' | 'trigger' | 'format' | 'placement' | 'creative' | 'hypothesis' | 'anchor';
  label: string;
  content?: any; 
  parentId?: string;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
  isExpanded?: boolean;
}

export interface CampaignSelections {
    personas: TargetPersona[];
    angles: string[];
    hooks: BuyingTriggerObject[];
    formats: string[];
}
