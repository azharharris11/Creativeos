
export type ViewMode = 'linear' | 'canvas' | 'dashboard' | 'mindmap';

export interface TargetPersona {
  description: string;
  painPoints: string[];
  desiredOutcomes: string[];
  age: string;
  creatorType: string;
}

export interface CampaignBlueprint {
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
    targetCountry: string;
    offerSummary: string;
    cta: string;
  };
}

// --- MATRIX ENGINE TYPES ---

export type MatrixVar_Format = 'UGC_Raw' | 'Editorial_Pro' | 'CCTV_Surveillance' | 'Meme_Chaotic';
export type MatrixVar_Setting = 'Private_Indoor' | 'Public_Indoor' | 'Nature_Outdoor' | 'Urban_Outdoor' | 'Abstract_Studio';
export type MatrixVar_Lighting = 'Golden_Hour' | 'Night_Flash' | 'Neon_RGB' | 'Natural_Window' | 'Office_Fluorescent';
export type MatrixVar_Persona = 'Gen_Z_User' | 'Mom_Dad_User' | 'Expert_Doctor' | 'Worker_BlueCollar' | 'Hand_Only';
export type MatrixVar_POV = 'Selfie' | 'First_Person' | 'Third_Person' | 'CCTV_High_Angle';
export type MatrixVar_Action = 'Applying_Product' | 'Shock_Reaction' | 'Struggle_Pain' | 'Result_Flexing';
export type MatrixVar_Tone = 'Urgent_Panic' | 'Skeptical' | 'Happy_Relieved' | 'Serious_Scientific';

export interface MatrixSlot {
  id: 'A' | 'B' | 'C' | string; // Allow string for dynamic slots in God Mode
  format: MatrixVar_Format | string;
  setting: MatrixVar_Setting | string;
  lighting: MatrixVar_Lighting | string;
  persona: MatrixVar_Persona | string;
  pov: MatrixVar_POV | string;
  action: MatrixVar_Action | string;
  tone: MatrixVar_Tone | string;
}

export const MATRIX_DEFAULTS: Record<'A' | 'B' | 'C', MatrixSlot> = {
  A: { id: 'A', format: 'UGC_Raw', setting: 'Private_Indoor', lighting: 'Natural_Window', persona: 'Gen_Z_User', pov: 'Selfie', action: 'Applying_Product', tone: 'Happy_Relieved' },
  B: { id: 'B', format: 'Editorial_Pro', setting: 'Abstract_Studio', lighting: 'Golden_Hour', persona: 'Expert_Doctor', pov: 'Third_Person', action: 'Result_Flexing', tone: 'Serious_Scientific' },
  C: { id: 'C', format: 'CCTV_Surveillance', setting: 'Urban_Outdoor', lighting: 'Night_Flash', persona: 'Worker_BlueCollar', pov: 'CCTV_High_Angle', action: 'Shock_Reaction', tone: 'Urgent_Panic' }
};

// --- OVERLAY & REMIX TYPES ---

export type OverlayStyle = 'IG_Story' | 'TikTok_Modern' | 'Meme_Impact';

export interface OverlayConfig {
    enabled: boolean;
    text: string;
    style: OverlayStyle;
    yPosition: number; // 0-100 percentage
}

export type RemixMode = 'scale_vibe' | 'scale_visual';

export interface Hypothesis {
  id: string;
  slotId: string;
  matrixConfig: MatrixSlot;
  hook: string; // The Golden Hook (Locked)
  visualPrompt: string;
  imageUrl?: string;
  isGenerating: boolean;
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

export type AppStep = 'landing' | 'anchor' | 'matrix' | 'reality' | 'input' | 'validateBlueprint' | 'dashboard';

// --- CAMPAIGN & MINDMAP TYPES ---

export type AwarenessStage = 'Problem Aware' | 'Solution Aware' | 'Product Aware' | 'Most Aware' | 'Unaware';
export const ALL_AWARENESS_STAGES: AwarenessStage[] = ['Problem Aware', 'Solution Aware', 'Product Aware', 'Most Aware', 'Unaware'];

export type CreativeFormat = string;
export const ALL_CREATIVE_FORMATS: string[] = ['Penawaran Langsung', 'UGC', 'Sebelum & Sesudah', 'Iklan Artikel', 'Carousel', 'Video', 'UGC_Raw', 'Editorial_Pro', 'CCTV_Surveillance', 'Meme_Chaotic'];

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