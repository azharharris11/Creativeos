
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Hypothesis, OverlayConfig, AdConcept, TextStyle } from '../types';

// Draw text on canvas with native social media styling
const drawOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, overlay: OverlayConfig) => {
    const { 
        text, 
        style, 
        yPosition, 
        color = '#ffffff', 
        backgroundColor = 'transparent', 
        fontSize: sizeScale = 40, // Relative scale 10-100
        textAlign = 'center',
        fontFamily = 'Inter' 
    } = overlay;

    const y = (yPosition / 100) * canvas.height;
    const x = textAlign === 'center' ? canvas.width / 2 : textAlign === 'left' ? canvas.width * 0.05 : canvas.width * 0.95;
    const maxWidth = canvas.width * 0.9;

    ctx.textAlign = textAlign as CanvasTextAlign;
    ctx.textBaseline = 'middle';

    // Map font family names to actual fonts
    const fontMap: Record<string, string> = {
        'Classic': 'Inter, sans-serif',
        'Modern': 'Montserrat, sans-serif',
        'Neon': 'Courier New, monospace',
        'Typewriter': 'Times New Roman, serif',
        'Meme': 'Impact, Oswald, sans-serif'
    };
    const actualFont = fontMap[fontFamily] || fontMap['Classic'];

    // Calculate actual pixel size based on scale (base width reference 1080px)
    const fontSize = (canvas.width * (sizeScale / 100)) * 0.15; 
    
    // Style specific tweaks
    if (style === 'Meme_Impact') {
        ctx.font = `900 ${fontSize}px ${fontMap['Meme']}`;
    } else {
        ctx.font = `700 ${fontSize}px ${actualFont}`;
    }

    // Split text into lines
    const words = text.split(' ');
    let line = '';
    const lines = [];
    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    const lineHeight = fontSize * 1.2;

    lines.forEach((l, i) => {
        const lineY = y + (i * lineHeight);
        const metrics = ctx.measureText(l);
        
        // Draw Background if not transparent
        if (backgroundColor && backgroundColor !== 'transparent') {
            const paddingX = fontSize * 0.4;
            const paddingY = fontSize * 0.2;
            let bgX = x;
            
            if (textAlign === 'center') bgX = x - metrics.width / 2;
            if (textAlign === 'right') bgX = x - metrics.width;

            ctx.fillStyle = backgroundColor;
            // Use roundRect if supported, else fillRect
            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(bgX - paddingX, lineY - lineHeight/2 - paddingY, metrics.width + (paddingX*2), lineHeight + (paddingY*2), 8);
                ctx.fill();
            } else {
                ctx.fillRect(bgX - paddingX, lineY - lineHeight/2 - paddingY, metrics.width + (paddingX*2), lineHeight + (paddingY*2));
            }
        }

        ctx.fillStyle = color;
        
        // Add Shadow/Stroke for specific styles
        if (style === 'TikTok_Modern' || style === 'Meme_Impact') {
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 0;
            ctx.lineWidth = fontSize * 0.08;
            ctx.strokeStyle = 'black';
            ctx.strokeText(l, x, lineY);
        } else {
            // Reset shadow
            ctx.shadowColor = 'transparent';
        }

        ctx.fillText(l, x, lineY);
    });
};

export const compositeHypothesisImage = async (hypothesis: Hypothesis): Promise<Blob | null> => {
    if (!hypothesis.imageUrl) return null;

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) { resolve(null); return; }

            // Draw base image
            ctx.drawImage(img, 0, 0);

            // Draw Overlay if enabled
            if (hypothesis.overlay && hypothesis.overlay.enabled) {
                drawOverlay(ctx, canvas, hypothesis.overlay);
            }

            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        };
        img.src = hypothesis.imageUrl;
    });
};

export const exportHypothesesToZip = async (hypotheses: Hypothesis[], campaignName: string) => {
    const zip = new JSZip();
    const csvRows = [];
    
    // CSV Header
    csvRows.push(['Campaign', 'Slot', 'Format', 'Persona', 'Hook', 'Roast Score', 'Vibe', 'Filename'].join(','));

    const validHypotheses = hypotheses.filter(h => h.imageUrl);
    if (validHypotheses.length === 0) throw new Error("No generated images to export.");

    for (const h of validHypotheses) {
        const blob = await compositeHypothesisImage(h);
        if (blob) {
            // CREATE FOLDER STRUCTURE: Persona / Format / Image
            // Clean filenames
            const safePersona = h.matrixConfig.persona.replace(/[^a-z0-9]/gi, '_');
            const safeFormat = h.matrixConfig.format.replace(/[^a-z0-9]/gi, '_');
            
            const folderName = `${safePersona}/${safeFormat}`;
            const filename = `${campaignName}_${h.slotId}.jpg`;
            
            // Add to zip in folder
            zip.folder(folderName)?.file(filename, blob);

            csvRows.push([
                `"${campaignName}"`,
                `"${h.slotId}"`,
                `"${h.matrixConfig.format}"`,
                `"${h.matrixConfig.persona}"`,
                `"${h.hook.replace(/"/g, '""')}"`,
                `"${h.aiRoast?.thumbstopScore || 0}"`,
                `"${h.aiRoast?.vibe || ''}"`,
                `"${folderName}/${filename}"`
            ].join(','));
        }
    }

    zip.file('ads_manager_import.csv', csvRows.join('\n'));

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${campaignName}_CreativeOS_Export.zip`);
};

export const dataURLtoBlob = (dataurl: string): Blob | null => {
    try {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.error("Error converting data URL to blob", e);
        return null;
    }
};

export const compositeTextOnImage = async (imageUrl: string, 
    hookData: { text?: string; style?: TextStyle }, 
    headlineData: { text?: string; style?: TextStyle }
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject("No context"); return; }
            
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
};

export const exportConceptsToZip = async (concepts: AdConcept[]) => {
    const zip = new JSZip();
    
    for (let i = 0; i < concepts.length; i++) {
        const c = concepts[i];
        if (c.imageUrls && c.imageUrls.length > 0) {
            const blob = dataURLtoBlob(c.imageUrls[0]); 
            if (blob) {
                zip.file(`${c.adSetName}_${i}.jpg`, blob);
            }
        }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `concepts_export.zip`);
};
