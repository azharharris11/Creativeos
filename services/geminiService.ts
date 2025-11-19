
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { CampaignBlueprint, MatrixSlot, Hypothesis, TargetPersona, BuyingTriggerObject, AdConcept, TextStyle, AspectRatio } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    1. "productInfo": Describe the PHYSICAL PRODUCT in detail. (e.g., "A small pink square bottle with a black dropper", "A white tube with red text"). Also mention the category (Skincare, Tech, Food).
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
    1. "productInfo": What is the product? Describe its likely physical appearance based on the text. Who is the target audience? (Summarize in 2 sentences).
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

// --- THE UGLIFIER ENGINE 3.2 (Enhanced Anchoring & Clean Plate) ---

const getFormatDirectives = (format: string, hookText: string) => {
    switch (format) {
        case 'Ugly_Problem_Visual':
            return `
            STYLE: Raw, unflattering, problem-focused photography.
            CONTENT: Show the messy, ugly truth of the problem (e.g., messy room, acne skin, dirty floor).
            VIBE: "I struggle with this too". Authentic and relatable.
            QUALITY: Low fidelity, amateur shot, bad angle.
            CLEAN PLATE: No specific requirement, but keep it messy.
            `;
        case 'Billboard_Context':
            return `
            STYLE: A photo of a roadside billboard or shop sign.
            POV: Shot from a moving car window or street level (low angle).
            ENVIRONMENT: Gritty urban street, cloudy sky, power lines visible.
            CLEAN PLATE: CRITICAL. The billboard surface must be PLAIN WHITE or SOLID COLOR. It must be a blank canvas ready for text. Do not put gibberish text on it.
            `;
        case 'MS_Paint_Nostalgia':
            return `
            STYLE: "Graphic design is my passion" meme aesthetic. Windows 95 vibe.
            ELEMENTS: Clashing colors (Red/Yellow/Blue), pixelated edges, jagged cutout of the product.
            COMPOSITION: Intentionally bad design.
            CLEAN PLATE: Use a solid color background (like pure bright blue #0000FF or yellow).
            `;
        case 'Instagram_Story_UX':
            return `
            STYLE: Mimics a raw photo taken natively inside the Instagram Story camera.
            CONTENT: A simple background (desk, floor, wall).
            VIBE: Native trust. "This is a friend's update".
            CLEAN PLATE: Ensure the top and bottom thirds of the image are relatively empty to allow for UI overlays.
            `;
        case 'Gmail_Letter_UX':
            return `
            STYLE: Minimalist digital screenshot.
            CONTENT: A simple white email body background. Resembles a Gmail read view.
            VIBE: Intimate, "We need to apologize", "Personal Update".
            CLEAN PLATE: The main area must be essentially white or very light gray paper texture.
            `;
        case 'Long_Text_Story':
            return `
            STYLE: Screenshot of the Apple Notes app (yellow lines) or Notion page.
            CONTENT: A digital note interface.
            VIBE: "I'm just jotting down thoughts". Intimate, diary-like.
            CLEAN PLATE: Render the yellow lined paper or white background, but keep it EMPTY of text so we can add our own.
            `;
        case 'Reddit_Thread_UX':
            return `
            STYLE: Screenshot of a Reddit text post (Dark mode or Light mode).
            CONTENT: Thread title and body.
            VIBE: Community-driven, Skeptical discussion.
            CLEAN PLATE: Render the layout of a forum post, but leave the text areas as blocks or very blurred lines.
            `;
        case 'Handwritten_Whiteboard':
            return `
            STYLE: A photo of a slightly dirty whiteboard in a home office.
            LIGHTING: Glare from a window, amateur lighting.
            VIBE: Educational, "Let me explain this", "Quick math".
            CLEAN PLATE: CRITICAL. The whiteboard must be EMPTY. No existing drawings. Ready for a marker.
            `;
        case 'Big_Font_Impact':
            return `
            STYLE: A solid, high-contrast background color (e.g., Warning Yellow, Alert Red, or Stark Black).
            CONTENT: Minimal distraction.
            VIBE: Warning sign, Pattern Interrupt.
            CLEAN PLATE: Pure solid color background.
            `;
        case 'CCTV_Security_Footage':
            return `
            STYLE: Security camera footage, fisheye lens distortion, black and white or desaturated.
            ANGLE: High angle looking down (Top-down).
            VIBE: Voyeuristic, raw, "caught on camera", "secret revealed".
            `;
        case 'Direct_Flash_Selfie':
            return `
            STYLE: Direct on-camera flash (snapshot aesthetic).
            LIGHTING: Harsh flash, dark background, hard shadows behind the object.
            VIBE: Cursed image, viral internet content, chaotic energy.
            `;
        case 'Meme_Format':
            return `
            STYLE: Classic internet meme template style.
            CONTENT: A relatable reaction image.
            VIBE: "Language of the internet".
            CLEAN PLATE: Leave space at the top or bottom for text caption.
            `;
        case 'Cartoonic_Graphic':
            return `
            STYLE: Simple, crude cartoon or doodle style.
            CONTENT: A stick figure or simple character dealing with a problem.
            VIBE: Storytelling, disarming, "inner child".
            CLEAN PLATE: Leave speech bubbles empty.
            `;
        default:
            return `
            Style: Amateur, raw, unpolished photography.
            `;
    }
};

export const generateHypothesisImage = async (
    slot: MatrixSlot, 
    productInfo: string, 
    hook: string,
    visualReference?: string,
    targetCountry: string = 'Global'
): Promise<string> => {
    
    const formatDirective = getFormatDirectives(slot.format, hook);
    const aspectRatio = slot.aspectRatio || '9:16';
    
    // Dynamic Localization Logic
    const getContext = (country: string) => {
        const countryUpper = country.trim().toUpperCase();
        if (countryUpper === 'INDONESIA') return "Context: Jakarta/Indonesia. Use local housing architecture, tropical lighting, motorcycle helmets in background, asian ethnicity subjects.";
        if (countryUpper === 'USA') return "Context: USA Suburbs. Wooden floors, american outlets, drywall backgrounds, big box stores, diverse ethnicity.";
        if (countryUpper === 'UK') return "Context: UK. Brick walls, cloudy weather, terraced housing interiors.";
        if (countryUpper === 'BRAZIL') return "Context: Brazil. Vibrant colors, tropical urban setting, local street style.";
        if (countryUpper === 'GLOBAL') return "Context: Global D2C. Relatable, non-descript home environments.";
        
        // FALLBACK FOR CUSTOM COUNTRIES: Ask AI to infer context
        return `Context: ${country}. Use architecture, lighting, and cultural cues specific to ${country}. Ensure the environment looks authentically local to this region.`;
    };

    // STRONG Object Anchoring Logic & Interaction
    let visualReferenceInstruction = "";
    if (visualReference) {
        visualReferenceInstruction = `
        CRITICAL INSTRUCTION - PRODUCT FIDELITY:
        1. You have been provided with a reference image of the PRODUCT.
        2. You MUST place this EXACT product (same shape, color, label, packaging) into the scene.
        3. DO NOT HALLUCINATE a different bottle, box, or item. Look at the input image and render THAT object.
        4. The product should be the focal point.
        5. ACTION REQUIREMENT: The subject (if present) MUST be interacting with the product (Holding it, pointing at it, applying it). Do not leave the product floating.
        `;
    } else {
        visualReferenceInstruction = `
        PRODUCT DESCRIPTION:
        ${productInfo}
        
        Since no reference image is provided, generate a realistic product based on the description above. 
        Ensure it matches the category cues (e.g. Skincare bottle, Supplement jar, Tech gadget).
        `;
    }

    // Aspect Ratio & Composition Instruction
    let aspectRatioInstruction = `ASPECT RATIO: ${aspectRatio}`;
    if (aspectRatio === '9:16') {
        aspectRatioInstruction += ". Composition: VERTICAL Mobile Fullscreen. Ensure key elements are central, leaving negative space at TOP and BOTTOM for UI overlays.";
    } else if (aspectRatio === '1:1') {
        aspectRatioInstruction += ". Composition: SQUARE. Center the subject. Tighter framing.";
    } else if (aspectRatio === '4:5') {
        aspectRatioInstruction += ". Composition: VERTICAL PORTRAIT. Standard social feed crop.";
    }

    // Lighting Sanity Check
    const lightingInstruction = slot.lighting === 'Harsh_Flash_ON' && (slot.setting === 'Overexposed_Sunlight' || slot.setting === 'Street_Pavement')
        ? "LIGHTING: Natural sunlight (override harsh flash as it conflicts with setting)"
        : `LIGHTING: ${slot.lighting.replace(/_/g, ' ')}`;

    const prompt = `
    ROLE: You are a specialized 'Lo-Fi' Social Media Ad photographer.
    TASK: Create a specific ad creative based on the Matrix configuration below.

    ${visualReferenceInstruction}

    THE MATRIX CONFIGURATION (Execute This):
    - FORMAT: ${slot.format.replace(/_/g, ' ')}
    - SETTING: ${slot.setting.replace(/_/g, ' ')} (Background)
    - ${lightingInstruction}
    - PERSONA POV: ${slot.pov.replace(/_/g, ' ')} (Camera angle)
    - ACTION: ${slot.action.replace(/_/g, ' ')} (Interaction with product)
    - TONE: ${slot.tone.replace(/_/g, ' ')}
    - ${aspectRatioInstruction}

    THE "UGLY AD" PHILOSOPHY:
    - The photo must look AMATEUR, RAW, and AUTHENTIC. 
    - It should look like it was taken by a real person on a phone, not a studio photographer.
    
    FORMAT DIRECTIVES:
    ${formatDirective}
    
    LOCALIZATION:
    ${getContext(targetCountry)}
    
    NEGATIVE PROMPT: professional studio, bokeh, cinematic lighting, 8k, masterpiece, perfect skin, makeup, model, symmetrical face, watermark, logo, beautiful, aesthetic, polished, corporate.
    `;

    const parts: any[] = [{ text: prompt }];
    
    // Inject Visual Reference if available (Multimodal)
    if (visualReference) {
        parts.unshift(imageB64ToGenerativePart(visualReference));
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
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
    Act as a brutal Direct Response Marketing Expert who loves "Ugly Ads". Analyze this creative.
    The Headline used is: "${hook}"

    Assess if this follows the "Ugly Ads Formula" (Raw, Authentic, Pattern Interrupt).
    If it looks too professional/stock-photo-like, give it a LOW score.
    If it looks amateur, messy, or "real", give it a HIGH score.

    Provide a JSON output with:
    1. "vibe": 3 words describing the aesthetic (e.g., "Raw, Cringey, Trustworthy").
    2. "targetAudience": Who does this appeal to?
    3. "thumbstopScore": A score from 0-100. High score = Ugly/Authentic enough to stop scrolling.
    4. "critique": A 1-sentence roast.

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
    You are a Direct Response Copywriter specializing in "Ugly Ads".
    Product: ${productContext}
    Original Winning Hook: "${originalHook}"
    
    Generate 3 NEW distinct variations of this hook using these specific "Ugly Ad" angles:
    1. The "Slippery Slope" (Long text opener, creating curiosity).
    2. The "Skeptical/Negative" (e.g. "I thought this was a scam...").
    3. The "Warning" (e.g. "Stop doing this if you want X").
    
    Keep them punchy (under 10 words) for the overlay, but implied they lead to longer text.
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
        return [originalHook + " (Warning)", originalHook + " (Skeptical)", originalHook + " (Secret)"];
    }
};

export const refineVisualPrompt = async (concept: AdConcept, blueprint: CampaignBlueprint): Promise<string> => {
    const prompt = `
    As a creative director, refine this visual prompt for an ad.
    
    CAMPAIGN CONTEXT:
    Product: ${blueprint.productAnalysis.name}
    Benefit: ${blueprint.productAnalysis.keyBenefit}
    Target Audience: ${blueprint.targetPersona.description}
    
    CURRENT CONCEPT:
    Hook: "${concept.hook}"
    Current Visual Prompt: "${concept.visualPrompt}"
    
    TASK:
    Rewrite the visual prompt to be more descriptive, photorealistic, and aligned with the "Ugly Ads" or "Lo-Fi" aesthetic if applicable, or high quality depending on the format.
    Format: ${concept.format}
    
    Return ONLY the new prompt text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
        });
        return response.text.trim();
    } catch (e) {
        console.error("Refine prompt failed", e);
        return concept.visualPrompt; // Fallback
    }
};

export const getDesignSuggestions = async (concept: AdConcept, imageBase64: string, blueprint: CampaignBlueprint): Promise<{ headlineStyle: TextStyle, textOverlayStyle: TextStyle }> => {
     const imagePart = imageB64ToGenerativePart(imageBase64);
     const prompt = `
     Analyze this ad image and suggest the optimal text layout for the Hook and Headline.
     
     Ad Format: ${concept.format}
     Hook Text: "${concept.hook}"
     Headline Text: "${concept.headline}"
     
     Output JSON with two objects: 'headlineStyle' (for the Hook) and 'textOverlayStyle' (for the Headline).
     Each style object must have:
     - fontFamily: string (e.g., 'Inter', 'Montserrat', 'Courier New', 'Impact')
     - fontSize: number (10-100, relative to width)
     - fontWeight: string (e.g., '700', '400')
     - color: string (hex code)
     - top: number (0-100 percentage)
     - left: number (0-100 percentage)
     - width: number (0-100 percentage)
     - textAlign: 'left' | 'center' | 'right'
     - textShadow: string (css value or 'none')
     - lineHeight: number
     
     Ensure text is legible against the background image.
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
                        headlineStyle: {
                             type: Type.OBJECT,
                             properties: {
                                 fontFamily: { type: Type.STRING },
                                 fontSize: { type: Type.NUMBER },
                                 fontWeight: { type: Type.STRING },
                                 color: { type: Type.STRING },
                                 top: { type: Type.NUMBER },
                                 left: { type: Type.NUMBER },
                                 width: { type: Type.NUMBER },
                                 textAlign: { type: Type.STRING, enum: ['left', 'center', 'right'] },
                                 textShadow: { type: Type.STRING },
                                 lineHeight: { type: Type.NUMBER }
                             }
                        },
                        textOverlayStyle: {
                             type: Type.OBJECT,
                             properties: {
                                 fontFamily: { type: Type.STRING },
                                 fontSize: { type: Type.NUMBER },
                                 fontWeight: { type: Type.STRING },
                                 color: { type: Type.STRING },
                                 top: { type: Type.NUMBER },
                                 left: { type: Type.NUMBER },
                                 width: { type: Type.NUMBER },
                                 textAlign: { type: Type.STRING, enum: ['left', 'center', 'right'] },
                                 textShadow: { type: Type.STRING },
                                 lineHeight: { type: Type.NUMBER }
                             }
                        }
                    }
                }
            }
        });
        
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Design suggestion failed", e);
        throw new Error("Failed to get design suggestions");
    }
};
