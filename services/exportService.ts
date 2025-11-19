
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Hypothesis, OverlayConfig, AdConcept, TextStyle } from '../types';

// Draw text on canvas with native social media styling
const drawOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, overlay: OverlayConfig) => {
    const { text, style, yPosition } = overlay;
    const y = (yPosition / 100) * canvas.height;
    const x = canvas.width / 2;
    const maxWidth = canvas.width * 0.8;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (style === 'IG_Story') {
        // Instagram Modern Style
        const fontSize = canvas.width * 0.08;
        ctx.font = `900 ${fontSize}px 'Inter', sans-serif`; // Modern sans
        
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

        // Draw rounded background per line
        lines.forEach((l, i) => {
            const lineY = y + (i * fontSize * 1.2);
            const metrics = ctx.measureText(l);
            const bgWidth = metrics.width + (fontSize * 0.5);
            const bgHeight = fontSize * 1.2;
            
            ctx.fillStyle = 'white';
            ctx.roundRect(x - bgWidth/2, lineY - bgHeight/2, bgWidth, bgHeight, 10);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.fillText(l, x, lineY);
        });

    } else if (style === 'TikTok_Modern') {
        // TikTok Style (White text, black outline/shadow)
        const fontSize = canvas.width * 0.07;
        ctx.font = `700 ${fontSize}px 'Proxima Nova', 'Arial', sans-serif`;
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const words = text.split(' ');
        let line = '';
        let lineY = y;
        
        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.strokeText(line, x, lineY);
                ctx.fillText(line, x, lineY);
                line = words[n] + ' ';
                lineY += fontSize * 1.2;
            } else {
                line = testLine;
            }
        }
        ctx.strokeText(line, x, lineY);
        ctx.fillText(line, x, lineY);

    } else if (style === 'Meme_Impact') {
        // Impact Font (Top/Bottom text style)
        const fontSize = canvas.width * 0.1;
        ctx.font = `900 ${fontSize}px 'Impact', 'Oswald', sans-serif`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = fontSize * 0.08;
        ctx.shadowBlur = 0;

        // Wrap text
        const words = text.toUpperCase().split(' ');
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

        lines.forEach((l, i) => {
            const lineY = y + (i * fontSize * 1.1);
            ctx.strokeText(l, x, lineY);
            ctx.fillText(l, x, lineY);
        });
    }
};

// Helper for AdConcept text overlay
const drawTextOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, text: string, style?: TextStyle) => {
    if (!style) return;
    // Basic implementation using style properties
    const fontSize = (style.fontSize / 100) * canvas.width;
    ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    ctx.textAlign = style.textAlign as CanvasTextAlign;
    // x, y based on percentages
    const x = (style.left / 100) * canvas.width;
    const y = (style.top / 100) * canvas.height;
    
    // Basic Text Fill
    ctx.fillText(text, x, y + fontSize); // simple baseline adjustment
}

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
            const filename = `${campaignName}_${h.slotId}_${h.matrixConfig.format}.jpg`;
            zip.file(filename, blob);

            csvRows.push([
                `"${campaignName}"`,
                `"${h.slotId}"`,
                `"${h.matrixConfig.format}"`,
                `"${h.matrixConfig.persona}"`,
                `"${h.hook.replace(/"/g, '""')}"`,
                `"${h.aiRoast?.thumbstopScore || 0}"`,
                `"${h.aiRoast?.vibe || ''}"`,
                `"${filename}"`
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
            
            if (hookData.text && hookData.style) {
                drawTextOverlay(ctx, canvas, hookData.text, hookData.style);
            }
            if (headlineData.text && headlineData.style) {
                drawTextOverlay(ctx, canvas, headlineData.text, headlineData.style);
            }
            
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
            // Save first image for now
            const blob = dataURLtoBlob(c.imageUrls[0]); 
            if (blob) {
                zip.file(`${c.adSetName}_${i}.jpg`, blob);
            }
        }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `concepts_export.zip`);
};