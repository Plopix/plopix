/**
 * Palettes mirroring sebastien.morel.me (Tailwind neutral + the site's `main`
 * orange). Each SVG ships in a light and a dark variant; the README picks one
 * with <picture> and prefers-color-scheme.
 */
export type Theme = {
    name: 'light' | 'dark';
    background: string;
    border: string;
    text: string;
    muted: string;
    subtle: string;
    accent: string;
    accentText: string;
    glow: string;
    chrome: string;
    pane: string;
    paneText: string;
    graphNode: string;
    graphEdge: string;
    badge: { fill: string; stroke: string; text: string };
    green: string;
    blue: string;
};

const shared = {
    accent: '#ff9900',
    green: '#22c55e',
    blue: '#60a5fa',
};

export const themes: Record<Theme['name'], Theme> = {
    light: {
        ...shared,
        name: 'light',
        background: '#ffffff',
        border: '#e5e5e5',
        text: '#171717',
        muted: '#737373',
        subtle: '#a3a3a3',
        accentText: '#e68900',
        glow: '#ffd08c',
        chrome: '#f5f5f5',
        pane: '#fafafa',
        paneText: '#525252',
        graphNode: '#404040',
        graphEdge: '#a3a3a3',
        badge: { fill: '#ffe4bf', stroke: '#ffd08c', text: '#bf6e00' },
    },
    dark: {
        ...shared,
        name: 'dark',
        background: '#171717',
        border: '#404040',
        text: '#ffffff',
        muted: '#a3a3a3',
        subtle: '#737373',
        accentText: '#ffa533',
        glow: '#995700',
        chrome: '#262626',
        pane: '#171717',
        paneText: '#d4d4d4',
        graphNode: '#e5e5e5',
        graphEdge: '#525252',
        badge: { fill: '#734100', stroke: '#995700', text: '#ffb85c' },
    },
};

export const fonts = {
    sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
};

/** Approximate advance of a monospace glyph, as a fraction of the font size. */
export const MONO_ADVANCE = 0.6;

/** Animations shared by every SVG; disabled for viewers who prefer reduced motion. */
export const motion = `
    @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes blink { 50% { opacity: 0; } }
    @keyframes pulse { 50% { opacity: .35; } }
    .rise { animation: rise .6s ease-out both; }
    .blink { animation: blink 1.1s step-end infinite; }
    .pulse { animation: pulse 1.6s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;

/** Inline style that delays an element's `rise` animation. */
export const delay = (seconds: number): string => `style="animation-delay:${seconds.toFixed(2)}s"`;
