
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

// --- THE UGLIFIER ENGINE 3.1 (Text-Aware) ---
// Updated to conditionally allow text for formats that require it (Notes, Whiteboard, etc.)

const getFormatDirectives = (format: string, hookText: string) => {
    switch (format) {
        case 'Ugly_Problem_Visual':
            return `
            STYLE: Raw, unflattering, problem-focused photography.
            CONTENT: Show the messy, ugly truth of the problem (e.g., messy room, acne skin, dirty floor).
            VIBE: "I struggle with this too". Authentic and relatable.
            QUALITY: Low fidelity, amateur shot, bad angle.
            TEXT INSTRUCTION: DO NOT RENDER TEXT. The image should be pure visual context.
            `;
        case 'Billboard_Context':
            return `
            STYLE: A photo of a roadside billboard or shop sign.
            POV: Shot from a moving car window or street level (low angle).
            ENVIRONMENT: Gritty urban street, cloudy sky, power lines visible.
            TEXT INSTRUCTION: RENDER TEXT. Write the following text clearly on the billboard: "${hookText}".
            The text should look printed on the sign, slightly weathered.
            `;
        case 'MS_Paint_Nostalgia':
            return `
            STYLE: "Graphic design is my passion" meme aesthetic. Windows 95 vibe.
            ELEMENTS: Clashing colors (Red/Yellow/Blue), pixelated edges, jagged cutout of the product.
            COMPOSITION: Intentionally bad design.
            TEXT INSTRUCTION: RENDER TEXT. Include the text "${hookText}" using Comic Sans or Times New Roman pixelated font in a bright color box.
            `;
        case 'Instagram_Story_UX':
            return `
            STYLE: Mimics a raw photo taken natively inside the Instagram Story camera.
            CONTENT: A simple background (desk, floor, wall).
            VIBE: Native trust. "This is a friend's update".
            TEXT INSTRUCTION: DO NOT RENDER TEXT. Leave space for UI overlay.
            `;
        case 'Gmail_Letter_UX':
            return `
            STYLE: Minimalist digital screenshot.
            CONTENT: A simple white email body background. Resembles a Gmail read view.
            VIBE: Intimate, "We need to apologize", "Personal Update".
            TEXT INSTRUCTION: RENDER TEXT. Show the subject line or body text as: "${hookText}". Use standard sans-serif email font.
            `;
        case 'Long_Text_Story':
            return `
            STYLE: Screenshot of the Apple Notes app (yellow lines) or Notion page.
            CONTENT: A digital note interface.
            VIBE: "I'm just jotting down thoughts". Intimate, diary-like.
            TEXT INSTRUCTION: RENDER TEXT. Write the following text on the note lines: "${hookText}". Make it look typed on a phone.
            `;
        case 'Reddit_Thread_UX':
            return `
            STYLE: Screenshot of a Reddit text post (Dark mode or Light mode).
            CONTENT: Thread title and body.
            VIBE: Community-driven, Skeptical discussion.
            TEXT INSTRUCTION: RENDER TEXT. The thread title must say: "${hookText}".
            `;
        case 'Handwritten_Whiteboard':
            return `
            STYLE: A photo of a slightly dirty whiteboard in a home office.
            LIGHTING: Glare from a window, amateur lighting.
            VIBE: Educational, "Let me explain this", "Quick math".
            TEXT INSTRUCTION: RENDER TEXT. Write the following text on the whiteboard using a black marker: "${hookText}". The handwriting should be messy but legible.
            `;
        case 'Big_Font_Impact':
            return `
            STYLE: A solid, high-contrast background color (e.g., Warning Yellow, Alert Red, or Stark Black).
            CONTENT: Minimal distraction.
            VIBE: Warning sign, Pattern Interrupt.
            TEXT INSTRUCTION: RENDER TEXT. The image should purely be the text "${hookText}" in a massive, bold font filling the frame.
            `;
        case 'CCTV_Security_Footage':
            return `
            STYLE: Security camera footage, fisheye lens distortion, black and white or desaturated.
            ANGLE: High angle looking down (Top-down).
            VIBE: Voyeuristic, raw, "caught on camera", "secret revealed".
            TEXT INSTRUCTION: DO NOT RENDER TEXT. Just the timestamp overlay.
            `;
        case 'Direct_Flash_Selfie':
            return `
            STYLE: Direct on-camera flash (snapshot aesthetic).
            LIGHTING: Harsh flash, dark background, hard shadows behind the object.
            VIBE: Cursed image, viral internet content, chaotic energy.
            TEXT INSTRUCTION: DO NOT RENDER TEXT.
            `;
        case 'Meme_Format':
            return `
            STYLE: Classic internet meme template style (Top text / Bottom text style or Twitter screenshot style).
            CONTENT: A relatable reaction image.
            VIBE: "Language of the internet".
            TEXT INSTRUCTION: RENDER TEXT. Include the caption: "${hookText}".
            `;
        case 'Cartoonic_Graphic':
            return `
            STYLE: Simple, crude cartoon or doodle style.
            CONTENT: A stick figure or simple character dealing with a problem.
            VIBE: Storytelling, disarming, "inner child".
            TEXT INSTRUCTION: RENDER TEXT. Use a speech bubble containing: "${hookText}".
            `;
        default:
            return `
            Style: Amateur, raw, unpolished photography.
            TEXT INSTRUCTION: DO NOT RENDER TEXT.
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
    
    // Determine if this is a text-heavy format where we WANT text in the image
    const textHeavyFormats = [
        'Handwritten_Whiteboard', 
        'Long_Text_Story', 
        'Gmail_Letter_UX', 
        'Billboard_Context', 
        'MS_Paint_Nostalgia', 
        'Reddit_Thread_UX', 
        'Big_Font_Impact',
        'Meme_Format',
        'Cartoonic_Graphic'
    ];
    const shouldRenderText = textHeavyFormats.includes(slot.format);

    // Relax Negative Prompt based on Text Requirement
    // If we want text, we remove "text", "letters", "watermark" from the negative prompt
    const standardNegative = "professional studio, bokeh, cinematic lighting, 8k, masterpiece, perfect skin, makeup, model, symmetrical face, text, watermark, logo, letters, beautiful, aesthetic, polished, corporate.";
    const textFriendlyNegative = "professional studio, bokeh, cinematic lighting, 8k, masterpiece, beautiful, aesthetic, polished, corporate, blur, unreadable text, gibberish.";
    
    const negativePrompt = shouldRenderText ? textFriendlyNegative : standardNegative;

    // Localization Logic
    const getContext = (country: string) => {
        switch(country) {
            case 'Indonesia': return "Context: Jakarta/Indonesia. Use local housing architecture, messy cables, tropical lighting, motorcycle helmets in background.";
            case 'USA': return "Context: USA Suburbs. Wooden floors, american outlets, drywall backgrounds, big box stores.";
            case 'UK': return "Context: UK. Brick walls, cloudy weather, terraced housing interiors.";
            case 'Brazil': return "Context: Brazil. Vibrant colors, tropical urban setting, local street style.";
            default: return "Context: Global D2C. Relatable, non-descript home environments.";
        }
    };

    // STRONG Object Anchoring Logic
    // This forces the model to prioritize the image over the text description of the product
    let visualReferenceInstruction = "";
    if (visualReference) {
        visualReferenceInstruction = `
        CRITICAL INSTRUCTION - PRODUCT FIDELITY:
        1. You have been provided with a reference image of the PRODUCT.
        2. You MUST place this EXACT product (same shape, color, label, packaging) into the scene.
        3. DO NOT HALLUCINATE a different bottle, box, or item. Look at the input image and render THAT object.
        4. The product should be the focal point, but integrated naturally into the "Ugly" environment.
        `;
    } else {
        visualReferenceInstruction = `
        PRODUCT DESCRIPTION:
        ${productInfo}
        
        Since no reference image is provided, generate a realistic product based on the description above. 
        Ensure it matches the category cues (e.g. Skincare bottle, Supplement jar, Tech gadget).
        `;
    }

    const prompt = `
    ROLE: You are a specialized 'Lo-Fi' Social Media Ad photographer.
    TASK: Create a specific ad creative based on the Matrix configuration below.

    ${visualReferenceInstruction}

    THE MATRIX CONFIGURATION (Execute This):
    - FORMAT: ${slot.format.replace(/_/g, ' ')}
    - SETTING: ${slot.setting.replace(/_/g, ' ')} (This is the background/environment)
    - LIGHTING: ${slot.lighting.replace(/_/g, ' ')} (This determines the mood/quality)
    - PERSONA POV: ${slot.pov.replace(/_/g, ' ')} (Camera angle)
    - ACTION: ${slot.action.replace(/_/g, ' ')} (What is happening to the product?)
    - TONE: ${slot.tone.replace(/_/g, ' ')}

    THE "UGLY AD" PHILOSOPHY:
    - The photo must look AMATEUR, RAW, and AUTHENTIC. 
    - It should look like it was taken by a real person on a phone, not a studio photographer.
    - Use the 'Setting' and 'Lighting' to create this "Ugly" aesthetic, BUT keep the Product clear and recognizable.

    FORMAT DIRECTIVES:
    ${formatDirective}
    
    LOCALIZATION:
    ${getContext(targetCountry)}
    
    NEGATIVE PROMPT: ${negativePrompt}
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

// Legacy services
export const generateCampaignOptions = async (blueprint: CampaignBlueprint): Promise<CampaignOptions> => {
    // Simulating AI Strategy Generation for DNA Step
    const prompt = `
    Analyze this product and generate ad strategy options.
    Product: ${blueprint.productAnalysis.name}
    Benefit: ${blueprint.productAnalysis.keyBenefit}
    Persona: ${blueprint.targetPersona.description}

    Generate:
    1. 5 Persona Variations (e.g. "The Skeptic", "The Busy Mom")
    2. 5 Strategic Angles (e.g. "Vs Competitor", "Scientific Mechanism")
    3. 5 Buying Triggers/Hooks (Short phrases)

    Return JSON.
    `;
    
    // NOTE: In a real app, call Gemini here. Returning mock data for UI flow connectivity.
    return {
        personaVariations: [
            { ...blueprint.targetPersona, description: "The Skeptic who tried everything" },
            { ...blueprint.targetPersona, description: "The Busy Professional" },
            { ...blueprint.targetPersona, description: "The Budget Conscious" }
        ],
        strategicAngles: ["Us vs Them", "The scientific breakthrough", "The 'Ugly Truth'", "Cost of Inaction", "Identity Shift"],
        buyingTriggers: [
            { name: "Fear of Missing Out" },
            { name: "Social Proof Stack" },
            { name: "Instant Gratification" }
        ]
    };
};
export const refineVisualPrompt = async (concept: AdConcept, blueprint: CampaignBlueprint): Promise<string> => { return ""; };
export const getDesignSuggestions = async (concept: AdConcept, imageBase64: string, blueprint: CampaignBlueprint): Promise<any> => { return {}; };
