import type { Home, Me } from '../types.ts';
import { escape, wrap } from '../text.ts';
import { delay, fonts, motion, type Theme } from './theme.ts';

const WIDTH = 840;
const PAD = 40;
const HEADLINE_SIZE = 40;
const HEADLINE_LEADING = 46;
// ~0.55em per Inter glyph at 40px across the 760px content width.
const HEADLINE_CHARS = 34;

type Hero = {
    me: Me;
    home: Home;
    site: string;
};

/**
 * The banner: role, the site's headline and focus areas. No avatar or name:
 * the GitHub profile sidebar already shows both right next to it.
 */
export const renderHero = ({ me, home, site }: Hero, theme: Theme): string => {
    const headline = wrap(home.headline, HEADLINE_CHARS);
    const statusY = PAD + 14;
    const headlineTop = 132;
    const focusY = headlineTop + (headline.length - 1) * HEADLINE_LEADING + 52;
    const height = focusY + PAD;

    const focus = home.focusAreas
        .map((area, index) => {
            const separator = index > 0 ? `<tspan fill="${theme.subtle}"> · </tspan>` : '';
            return `${separator}<tspan>${escape(area)}</tspan>`;
        })
        .join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="title">
<title id="title">${escape(`${me.jobTitle} @ ${me.company}. ${home.headline}`)}</title>
<defs>
    <style>${motion}
        .sans { font-family: ${fonts.sans}; }
        .mono { font-family: ${fonts.mono}; }
    </style>
    <radialGradient id="glow" cx="88%" cy="0%" r="70%">
        <stop offset="0" stop-color="${theme.glow}" stop-opacity="${theme.name === 'dark' ? 0.55 : 0.6}"/>
        <stop offset="1" stop-color="${theme.glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="${theme.subtle}" fill-opacity=".35"/>
    </pattern>
    <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
        <stop offset=".35" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="fade-mask"><rect width="${WIDTH}" height="${height}" fill="url(#fade)"/></mask>
    <clipPath id="frame"><rect width="${WIDTH}" height="${height}" rx="16"/></clipPath>
</defs>
<g clip-path="url(#frame)">
    <rect width="${WIDTH}" height="${height}" fill="${theme.background}"/>
    <rect width="${WIDTH}" height="${height}" fill="url(#dots)" mask="url(#fade-mask)"/>
    <rect width="${WIDTH}" height="${height}" fill="url(#glow)"/>
</g>
<rect x=".5" y=".5" width="${WIDTH - 1}" height="${height - 1}" rx="16" fill="none" stroke="${theme.border}"/>

<circle class="pulse" cx="${PAD + 5}" cy="${statusY - 5}" r="5" fill="${theme.accent}"/>
<text class="sans rise" x="${PAD + 20}" y="${statusY}" font-size="15" fill="${theme.muted}">${escape(me.jobTitle)} @ <tspan fill="${theme.text}" font-weight="600">${escape(me.company)}</tspan></text>
<text class="mono rise" x="${WIDTH - PAD}" y="${statusY}" text-anchor="end" font-size="12" fill="${theme.subtle}" ${delay(0.1)}>${escape(new URL(site).host)} ↗</text>

${headline
    .map(
        (line, index) =>
            `<text class="sans rise" x="${PAD}" y="${headlineTop + index * HEADLINE_LEADING}" font-size="${HEADLINE_SIZE}" font-weight="600" letter-spacing="-1.2" fill="${theme.text}" ${delay(0.2 + index * 0.1)}>${escape(line)}</text>`,
    )
    .join('\n')}
<text class="mono rise" x="${PAD}" y="${focusY}" font-size="14" fill="${theme.accentText}" ${delay(0.3 + headline.length * 0.1)}>${focus}<tspan class="blink" fill="${theme.accent}"> ▍</tspan></text>
</svg>
`;
};
