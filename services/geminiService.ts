
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { CampaignBlueprint, MatrixSlot, Hypothesis, TargetPersona, BuyingTriggerObject, AdConcept, TextStyle } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface CampaignOptions {
    personaVariations: TargetPersona[];
    strategicAngles: string[];
    buyingTriggers: BuyingTriggerObject[];
}

const imageB64ToGenerativePart = (base64Data: string, mimeType: string = 'image/jpeg') => {
  return {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };
};

// --- AI EXTRACTION SERVICES (ANCHOR PHASE) ---

export const extractAnchorFromImage = async (base64Data: string): Promise<{ productInfo: string, goldenHook: string }> => {
    const imagePart = imageB64ToGenerativePart(base64Data);
    const prompt = `
    Analyze this advertisement image as a Direct Response Marketing Expert.
    
    Extract two critical pieces of information:
    1. "productInfo": What is the product? Who is the specific target audience? What is the key benefit? (Summarize in 2 sentences).
    2. "goldenHook": What is the MAIN Offer, Promise, or Hook text visible in the image? (e.g. "50% Off", "Money Back Guarantee", "Kill Acne in 3 Days"). Keep it short and punchy.

    Return JSON only.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [imagePart, { text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        productInfo: { type: Type.STRING },
                        goldenHook: { type: Type.STRING }
                    }
                }
            }
        });
        
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Image extraction failed", e);
        throw new Error("Failed to analyze image. Please try manual input.");
    }
};

export const extractAnchorFromText = async (textInput: string): Promise<{ productInfo: string, goldenHook: string }> => {
    const prompt = `
    Analyze the following marketing copy (from a landing page or ad caption).
    
    COPY DATA:
    "${textInput.substring(0, 2000)}"
    
    Extract two critical pieces of information:
    1. "productInfo": What is the product? Who is the target audience? (Summarize in 2 sentences).
    2. "goldenHook": What is the strongest Hook or Offer found in the text? (e.g. "Garansi Uang Kembali", "Beli 1 Gratis 1"). Keep it under 10 words.

    Return JSON only.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        productInfo: { type: Type.STRING },
                        goldenHook: { type: Type.STRING }
                    }
                }
            }
        });
        
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Text extraction failed", e);
        throw new Error("Failed to analyze text. Please try manual input.");
    }
};

// --- THE UGLIFIER ENGINE ---
const getFormatDirectives = (format: string) => {
    switch (format) {
        case 'UGC_Raw':
            return `
            STYLE: Amateur phone photography, shot on iPhone 14. 
            QUALITY: Low fidelity, slight noise, NOT professional.
            IMPERFECTIONS: Messy background, unmade bed, clutter on table, slight motion blur.
            LIGHTING: Bad lighting is okay. Mixed color temperatures.
            FORBIDDEN: Bokeh, studio lighting, perfect skin, professional composition.
            `;
        case 'Editorial_Pro':
            return `
            STYLE: High-end magazine advertisement, shot on Hasselblad.
            QUALITY: Ultra-sharp, 8k resolution, professional color grading.
            LIGHTING: Studio softbox, rim lighting, perfect separation from background.
            COMPOSITION: Rule of thirds, balanced, clean negative space.
            `;
        case 'CCTV_Surveillance':
            return `
            STYLE: Security camera footage, fisheye lens distortion.
            QUALITY: Grainy, timestamp overlay style, high contrast, desaturated.
            ANGLE: High angle looking down (Top-down).
            VIBE: Voyeuristic, raw, "caught on camera" feel.
            `;
        case 'Meme_Chaotic':
            return `
            STYLE: Direct flash photography (snapshot aesthetic).
            LIGHTING: Harsh on-camera flash, dark background, high contrast / deep shadows.
            VIBE: Cursed image aesthetic, viral internet content, chaotic energy.
            COLORS: Oversaturated, frying effect.
            `;
        default:
            return `Style: Realistic photography adapted for ${format}.`;
    }
};

export const generateHypothesisImage = async (slot: MatrixSlot, productInfo: string, hook: string): Promise<string> => {
    
    const formatDirective = getFormatDirectives(slot.format);
    
    const INDONESIAN_CONTEXT = "Context: Indonesia. Use local housing architecture (ceramic tiles, gypsum ceiling), local skin tones (Southeast Asian), and modest styling.";

    // Critical: Explicitly forbid text rendering because we use Native Overlay
    const prompt = `
    Create a photo for a social media ad.
    ASPECT RATIO: 9:16 (Vertical Mobile Wallpaper).
    
    THE SCENE:
    - Subject: ${slot.persona.replace(/_/g, ' ')}
    - Action: ${slot.action.replace(/_/g, ' ')}
    - Setting: ${slot.setting.replace(/_/g, ' ')}
    - Lighting Code: ${slot.lighting.replace(/_/g, ' ')}
    - Camera POV: ${slot.pov.replace(/_/g, ' ')}
    - Emotional Tone: ${slot.tone.replace(/_/g, ' ')}

    PRODUCT CONTEXT:
    ${productInfo}

    CRITICAL INSTRUCTION:
    DO NOT RENDER ANY TEXT. DO NOT ADD CAPTIONS. DO NOT ADD LOGOS.
    The image must be clean because text will be added programmatically later.
    
    THE UGLIFIER DIRECTIVES (STRICTLY FOLLOW):
    ${formatDirective}
    
    LOCALIZATION:
    ${INDONESIAN_CONTEXT}
    
    NEGATIVE PROMPT: text, watermark, logo, letters, alphabet, signage, illustration, painting, 3d render, cartoon, anime, deformed, distorted faces.
    `;

    try {
        // Switch to gemini-2.5-flash-image (Nano Banana) as requested
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        
        if (part && part.inlineData && part.inlineData.data) {
             return `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
        }
        
        throw new Error('No image data returned');
    } catch (e: any) {
        console.error("Hypothesis generation failed:", e);
        throw new Error(e.message || 'Failed to generate image');
    }
};

export const roastHypothesis = async (imageBase64: string, hook: string) => {
    const imagePart = imageB64ToGenerativePart(imageBase64);
    const prompt = `
    Act as a brutal Senior Creative Director. Analyze this ad creative.
    The Headline used is: "${hook}"

    Provide a JSON output with:
    1. "vibe": 3 words describing the aesthetic (e.g., "Cheap, Authentic, Scary").
    2. "targetAudience": Who does this appeal to? (e.g., "Stressed Students", "Rich Moms").
    3. "thumbstopScore": A score from 0-100 on how likely this is to stop scrolling. Be harsh.
    4. "critique": A 1-sentence roast of why it works or fails.

    Output JSON only.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [imagePart, { text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        vibe: { type: Type.STRING },
                        targetAudience: { type: Type.STRING },
                        thumbstopScore: { type: Type.NUMBER },
                        critique: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Roast failed", e);
        return { vibe: "Error", targetAudience: "Unknown", thumbstopScore: 0, critique: "AI failed to roast this image." };
    }
};

export const generateHookVariations = async (originalHook: string, productContext: string): Promise<string[]> => {
    const prompt = `
    You are a Direct Response Copywriter.
    Product: ${productContext}
    Original Winning Hook: "${originalHook}"
    
    Generate 3 NEW distinct variations of this hook using different angles (e.g., Urgency, Curiosity, Benefit).
    Keep them short (under 10 words).
    Return a JSON array of strings.
    `;

    try {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Hook variation failed", e);
        return [originalHook + " (V1)", originalHook + " (V2)", originalHook + " (V3)"];
    }
};

// Legacy services
export const generateCampaignOptions = async (blueprint: CampaignBlueprint): Promise<CampaignOptions> => {
    return { personaVariations: [], strategicAngles: [], buyingTriggers: [] };
};
export const refineVisualPrompt = async (concept: AdConcept, blueprint: CampaignBlueprint): Promise<string> => { return ""; };
export const getDesignSuggestions = async (concept: AdConcept, imageBase64: string, blueprint: CampaignBlueprint): Promise<any> => { return {}; };
