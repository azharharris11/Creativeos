
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

// --- THE UGLIFIER ENGINE 4.1 (Baked-In Text Support) ---

// List of formats where AI should write the text into the image
const TEXT_RENDER_FORMATS = [
    'Handwritten_Whiteboard',
    'Billboard_Context',
    'MS_Paint_Nostalgia',
    'Big_Font_Impact',
    'Meme_Format',
    'Cartoonic_Graphic'
];

const getFormatDirectives = (format: string, hook: string) => {
    switch (format) {
        // ---------------------------------------------------------
        // CATEGORY 1: TEXTURE / CANVAS (Clean Plates for Overlay)
        // ---------------------------------------------------------
        
        case 'Gmail_Letter_UX':
            return `
            TYPE: User Interface Mockup Background.
            VISUAL: A flat white screen background. 
            DETAILS: At the very top, hint at a standard email header line (faint grey line with "To: Me"), but keep the main body COMPLETELY WHITE and EMPTY.
            VIBE: Digital utility, boring, administrative.
            CRITICAL: Do not render any fake text blocks. Leave the body empty for overlay.
            `;
            
        case 'Long_Text_Story': // Notes App style
            return `
            TYPE: Digital Note Interface Background.
            VISUAL: A macro close-up of a digital screen displaying the 'Apple Notes' texture (faint yellow paper texture) OR a 'Notion' style stark white page.
            VIBE: Personal diary, rough draft.
            CRITICAL: It must be a blank page ready for typing. No existing scribbles. No 3D phones. Just the UI texture.
            `;

        case 'Reddit_Thread_UX':
            return `
            TYPE: Dark Mode UI Background.
            VISUAL: A dark grey (#1A1A1B) flat background resembling a Reddit thread in dark mode.
            DETAILS: Faint grey separators lines.
            CRITICAL: Leave the center area empty for text. No gibberish text generation.
            `;

        // ---------------------------------------------------------
        // CATEGORY 2: SCENE / PHOTO (Authentic Ugly + Baked Text)
        // ---------------------------------------------------------

        case 'Handwritten_Whiteboard':
            return `
            TYPE: Snapshot of a Whiteboard.
            VISUAL: A dirty, used whiteboard in a poorly lit home office. 
            DETAILS: Smudge marks, marker residue, bad overhead fluorescent lighting reflection.
            TEXT RENDERING: The text "${hook}" MUST be handwritten on the board in black or red marker. It should look messy but legible.
            `;

        case 'Ugly_Problem_Visual':
            return `
            TYPE: Amateur Flash Photography (Snapshot).
            SUBJECT: Focus on the MESS and CHAOS. 
            DETAILS: If bedroom: Unmade bed, clothes on floor, trash. If skin: extreme close up of texture, oily, pores visible. 
            LIGHTING: Harsh, direct on-camera flash that creates hard shadows. High contrast.
            VIBE: Stressful, overwhelming, gross, real life.
            ANTI-AESTHETIC: Make it look unbalanced and poorly framed.
            `;
            
        case 'Billboard_Context':
            return `
            TYPE: Street Photography.
            SUBJECT: A mundane street corner or roadside with a billboard/signage.
            TEXT RENDERING: The billboard MUST display the text: "${hook}" in large, bold letters.
            ENVIRONMENT: Grey skies, concrete, maybe a blurry car passing by. Unremarkable urban setting.
            `;

        case 'MS_Paint_Nostalgia':
            return `
            TYPE: Digital Collage / Glitch Art.
            VISUAL: A crude cutout of the product placed on a garish, clashing background (e.g., Neon Green or Blue background).
            TEXT RENDERING: Include the text "${hook}" in a crude font like Comic Sans or Arial, possibly pixelated.
            STYLE: "Graphic design is my passion" meme style. Pixelated edges.
            `;
        
        case 'Big_Font_Impact':
            return `
            TYPE: Text-based Image / Warning Sign.
            VISUAL: A solid color background (Yellow, Red, or White) or a textured surface (Cardboard, Skin, Paper).
            TEXT RENDERING: The text "${hook}" MUST be written/printed in HUGE, IMPACTFUL letters filling the frame.
            VIBE: Urgent, warning, stop scrolling.
            `;

        case 'Meme_Format':
            return `
            TYPE: Classic Internet Meme.
            VISUAL: A funny or relatable reaction image (e.g., confused person, chaotic scene).
            TEXT RENDERING: Top Text / Bottom Text style containing: "${hook}".
            FONT: Impact font, white text with black outline.
            `;

        case 'CCTV_Security_Footage':
            return `
            TYPE: Surveillance Camera Feed.
            VISUAL: High angle (top-down), wide fisheye lens distortion.
            COLOR: Desaturated, grainy, low resolution, maybe a timestamp in the corner.
            LIGHTING: Dim, spooky, or harsh industrial lighting.
            `;

        case 'Direct_Flash_Selfie':
            return `
            TYPE: Bad Selfie.
            VISUAL: Shot from a slightly too-low angle (double chin angle).
            LIGHTING: "Deer in headlights" look using direct flash in a dark room.
            SKIN: Shiny, oily, imperfect.
            BACKGROUND: A boring hallway or messy bathroom mirror.
            `;

        case 'Cartoonic_Graphic':
             return `
             TYPE: Crude Doodle on Paper.
             VISUAL: A drawing on a napkin or notebook paper. Stick figures.
             TEXT RENDERING: Handwritten text next to the drawing: "${hook}".
             STYLE: Child-like, simple, black ink on paper.
             `;

        default:
            return `STYLE: Amateur phone photo, raw, unedited.`;
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
    
    // DETERMINATION LOGIC:
    // 1. Should we render text? (Billboard, Whiteboard, etc.)
    const shouldRenderText = TEXT_RENDER_FORMATS.includes(slot.format);
    
    // 2. Is it a pure Clean Plate UI? (Gmail, Notes, Reddit) -> Branch 1
    const isCleanPlateUI = [
        'Gmail_Letter_UX', 
        'Long_Text_Story', 
        'Reddit_Thread_UX'
    ].includes(slot.format);
    
    // Dynamic Localization Logic
    const getContext = (country: string) => {
        const countryUpper = country.trim().toUpperCase();
        if (countryUpper === 'INDONESIA') return "Context: Jakarta/Indonesia. Use local housing architecture, tropical lighting, motorcycle helmets in background, asian ethnicity subjects.";
        if (countryUpper === 'USA') return "Context: USA Suburbs. Wooden floors, american outlets, drywall backgrounds, big box stores, diverse ethnicity.";
        if (countryUpper === 'UK') return "Context: UK. Brick walls, cloudy weather, terraced housing interiors.";
        if (countryUpper === 'BRAZIL') return "Context: Brazil. Vibrant colors, tropical urban setting, local street style.";
        if (countryUpper === 'GLOBAL') return "Context: Global D2C. Relatable, non-descript home environments.";
        return `Context: ${country}. Use architecture, lighting, and cultural cues specific to ${country}. Ensure the environment looks authentically local to this region.`;
    };

    // Aspect Ratio & Composition Instruction
    let aspectRatioInstruction = `ASPECT RATIO: ${aspectRatio}`;
    if (aspectRatio === '9:16') {
        aspectRatioInstruction += ". Composition: VERTICAL Mobile Fullscreen.";
    } else if (aspectRatio === '1:1') {
        aspectRatioInstruction += ". Composition: SQUARE. Tighter framing.";
    } else if (aspectRatio === '4:5') {
        aspectRatioInstruction += ". Composition: VERTICAL PORTRAIT.";
    }

    let prompt = "";
    const parts: any[] = [];

    // Define Negative Prompt dynamically based on text rendering needs
    let negativePrompt = "professional, studio lighting, bokeh, cinematic, aesthetic, instagrammable, symmetrical, 8k, masterpiece, beautiful, smooth skin, perfect composition, illustration, painting, drawing, cgi, 3d render";
    
    if (isCleanPlateUI) {
        // For clean plates, FORBID text to keep area empty for overlay
        negativePrompt += ", text, letters, words, writing, watermark, logo, person, face, hand, object, 3d, realistic scene, landscape, depth of field, blur";
        
        // BRANCH 1: TEXTURE/CANVAS GENERATION (Clean Plate)
        prompt = `
        TASK: Generate a flat background texture/canvas.
        ${aspectRatioInstruction}
        
        DIRECTIVE:
        ${formatDirective}
        
        NEGATIVE PROMPT: ${negativePrompt}
        `;
        parts.push({ text: prompt });

    } else {
        // BRANCH 2: SCENE/PHOTO GENERATION (Authentic Ugly + Optional Baked Text)
        
        // If standard photo (Ugly Visual) and NOT baked text, prefer no gibberish text
        if (!shouldRenderText) {
             negativePrompt += ", watermark, logo, subtitles, caption"; 
        }

        // STRONG Object Anchoring Logic & Interaction
        let visualReferenceInstruction = "";
        const isDigitalCollage = slot.format === 'MS_Paint_Nostalgia';

        if (visualReference) {
            visualReferenceInstruction = `
            CRITICAL INSTRUCTION - PRODUCT FIDELITY:
            1. You have been provided with a reference image of the PRODUCT.
            2. ${isDigitalCollage ? 'Cut out this product and paste it onto the background.' : 'Place this EXACT product (same shape, color, label) into the scene.'}
            3. DO NOT HALLUCINATE a different bottle/box. Use the reference.
            4. ${isDigitalCollage ? '' : 'Subject must be interacting with it (holding, using).'}
            `;
            // Add image part
            parts.push(imageB64ToGenerativePart(visualReference));
        } else {
            visualReferenceInstruction = `
            PRODUCT DESCRIPTION: ${productInfo}
            Generate a realistic product based on this description.
            `;
        }

        prompt = `
        ROLE: You are an amateur photographer using an old smartphone.
        TASK: Capture a candid, unpolished moment.
        ${aspectRatioInstruction}

        SCENE CONFIGURATION:
        - Subject: ${slot.persona.replace(/_/g, ' ')}
        - Action: ${slot.action.replace(/_/g, ' ')}
        - Setting: ${slot.setting.replace(/_/g, ' ')}
        - Lighting: ${slot.lighting.replace(/_/g, ' ')}

        THE "UGLY" DIRECTIVE (Override all beauty standards):
        ${formatDirective}
        
        ${shouldRenderText ? `TEXT GENERATION TASK:\nThe image MUST contain the text "${hook}" as specified in the directive. Ensure spelling is correct.` : ''}

        PRODUCT INJECTION:
        ${visualReferenceInstruction}

        LOCALIZATION:
        ${getContext(targetCountry)}
        
        NEGATIVE PROMPT: ${negativePrompt}
        `;
        
        parts.push({ text: prompt });
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
     - textAlign: { type: Type.STRING, enum: ['left', 'center', 'right'] },
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
