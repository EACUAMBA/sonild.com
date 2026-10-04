import {type CSSProperties, useEffect, useState} from 'react';

type Palette = CSSProperties & Record<`--${string}`, string>;

// Quantized colour clusters avoid averaging unrelated colours into muddy grey.
export function paletteFromPixels(pixels: Uint8ClampedArray): Palette | undefined {
    const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
    for (let i = 0; i < pixels.length; i += 4) {
        const [r, g, b, alpha] = pixels.subarray(i, i + 4);
        if (alpha < 128) continue;
        const brightness = (r + g + b) / 3;
        if (brightness < 20 || brightness > 240) continue;
        const key = (r >> 5) * 64 + (g >> 5) * 8 + (b >> 5);
        const bucket = buckets.get(key) ?? {count: 0, r: 0, g: 0, b: 0};
        bucket.count++;
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        buckets.set(key, bucket);
    }
    const dominant = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
    if (!dominant) return;
    const [r, g, b] = [dominant.r, dominant.g, dominant.b].map((value) => value / dominant.count / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    const lightness = (max + min) / 2;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
    let hue = 0;
    if (delta) {
        hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
        hue = (hue * 60 + 360) % 360;
    }
    const sat = Math.min(42, saturation * 100);
    const colour = (l: number, s = sat) => `hsl(${Math.round(hue)} ${Math.round(s)}% ${l}%)`;
    return {
        '--ink': colour(19, sat * .55), '--olive': colour(29), '--gold': colour(35, sat * .75),
        '--cream': colour(98, sat * .45), '--paper': colour(96, sat * .35),
        '--surface': colour(99, sat * .3), '--soft': colour(92, sat * .45),
        '--border': colour(77, sat * .4), '--muted': colour(36, sat * .4),
        '--accent-light': colour(83, sat * .7),
        '--cover-shade': `${Math.round(hue)} ${Math.round(sat * .55)}% 12%`,
    };
}

export default function useInvitationPalette(src?: string | null): Palette | undefined {
    const [result, setResult] = useState<{ src: string; palette: Palette } | null>(null);
    useEffect(() => {
        if (!src) return;
        let cancelled = false;
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            if (cancelled) return;
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const context = canvas.getContext('2d', {willReadFrequently: true});
                if (!context) return;
                context.drawImage(image, 0, 0, 64, 64);
                const palette = paletteFromPixels(context.getImageData(0, 0, 64, 64).data);
                if (palette) setResult({src, palette});
            } catch {
                // Keep the original palette if the image cannot be sampled (for example CORS).
            }
        };
        image.src = src;
        return () => {
            cancelled = true;
            image.onload = null;
        };
    }, [src]);
    return result?.src === src ? result?.palette : undefined;
}
