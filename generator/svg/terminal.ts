import type { Home } from '../types.ts';
import { escape } from '../text.ts';
import { delay, fonts, MONO_ADVANCE, motion, type Theme } from './theme.ts';

const WIDTH = 840;
const TITLE_BAR = 38;
const STATUS_BAR = 32;
const PANE_WIDTH = (WIDTH - 1) / 2;
const PAD = 18;
const FONT = 13;
const LEADING = 21;
const BASELINE = 15;
const CHAR = FONT * MONO_ADVANCE;
const MAX_CHARS = Math.floor((PANE_WIDTH - PAD * 2) / CHAR);

// Same agent workflow graph as the site's "graph" pane; <b> marks the nodes.
const graphArt = [
    '<b>plan</b> ─┬─ <b>api</b> ───┐',
    '      ├─ <b>ui</b> ────┼─ <b>review</b> ↺',
    '      └─ <b>tests</b> ─┘  │',
    '                   └─ <b>human</b> ─ <b>merge</b>',
];

type Segment = { text: string; fill: string; bold?: boolean };

/** A pane row; `render` receives the row's top-left corner and the usable width. */
type Line = { height: number; render: (x: number, y: number, width: number) => string };

const tspans = (segments: Segment[]): string =>
    segments
        .map(
            ({ text, fill, bold }) =>
                `<tspan fill="${fill}"${bold ? ' font-weight="600"' : ''}>${escape(text)}</tspan>`,
        )
        .join('');

const text = (segments: Segment[], extra = ''): Line => ({
    height: LEADING,
    render: (x, y) => `<text x="${x}" y="${y + BASELINE}"${extra}>${tspans(segments)}</text>`,
});

/** Wraps styled segments on word boundaries, keeping each word's style. */
export const wrapSegments = (segments: Segment[], maxChars: number): Segment[][] => {
    const lines: Segment[][] = [];
    let line: Segment[] = [];
    let length = 0;
    for (const word of segments.flatMap((segment) =>
        segment.text
            .split(/\s+/)
            .filter(Boolean)
            .map((piece) => ({ ...segment, text: piece })),
    )) {
        if (line.length > 0 && length + 1 + word.text.length > maxChars) {
            lines.push(line);
            line = [];
            length = 0;
        }
        line.push(line.length > 0 ? { ...word, text: ` ${word.text}` } : word);
        length += (line.length > 1 ? 1 : 0) + word.text.length;
    }
    if (line.length > 0) {
        lines.push(line);
    }
    return lines;
};

const prompt = (command: string, theme: Theme): Line =>
    text([
        { text: '$ ', fill: theme.green },
        { text: command, fill: theme.subtle },
    ]);

const agentBadges = (names: string[], theme: Theme): Line => {
    const size = 12;
    const height = 22;
    const gap = 8;
    const widths = names.map((name) => name.length * size * MONO_ADVANCE + 20);
    const rows: { name: string; width: number; offset: number }[][] = [[]];
    let offset = 0;
    names.forEach((name, index) => {
        if (offset > 0 && offset + widths[index] > PANE_WIDTH - PAD * 2) {
            rows.push([]);
            offset = 0;
        }
        rows[rows.length - 1].push({ name, width: widths[index], offset });
        offset += widths[index] + gap;
    });
    return {
        height: rows.length * (height + gap) + 4,
        render: (x, y) =>
            rows
                .flatMap((row, rowIndex) =>
                    row.map(({ name, width, offset }) => {
                        const top = y + 6 + rowIndex * (height + gap);
                        return `<rect x="${x + offset}" y="${top}" width="${width}" height="${height}" rx="6" fill="${theme.badge.fill}" stroke="${theme.badge.stroke}"/><text x="${x + offset + width / 2}" y="${top + 15}" text-anchor="middle" font-size="${size}" font-weight="600" fill="${theme.badge.text}">${escape(name)}</text>`;
                    }),
                )
                .join(''),
    };
};

const orchestratePane = ({ orchestration }: Home['aiWorkflow'], theme: Theme): Line[] => [
    prompt(`orchestrate --agents x${orchestration.agentCount}`, theme),
    ...wrapSegments(
        [
            { text: orchestration.mux, fill: theme.accent, bold: true },
            { text: 'managing shells · custom', fill: theme.paneText },
            { text: orchestration.loop, fill: theme.accent, bold: true },
            { text: 'orchestrated via a custom', fill: theme.paneText },
            { text: orchestration.runtime, fill: theme.blue },
            { text: 'binary', fill: theme.paneText },
        ],
        MAX_CHARS,
    ).map((segments) => text(segments)),
    agentBadges(orchestration.agents, theme),
    {
        height: LEADING,
        render: (x, y) =>
            `<circle class="pulse" cx="${x + 4}" cy="${y + BASELINE - 4}" r="4" fill="${theme.green}"/><text x="${x + 14}" y="${y + BASELINE}" fill="${theme.subtle}">All agents running in parallel...</text>`,
    },
];

const graphPane = (theme: Theme): Line[] => [
    prompt('graph run prd.json', theme),
    ...graphArt.map((row) =>
        text(
            // split() with a capture group alternates edge, node, edge… so odd pieces are nodes.
            row
                .split(/<b>(.*?)<\/b>/)
                .map((piece, index) =>
                    index % 2 === 1
                        ? { text: piece, fill: theme.graphNode, bold: true }
                        : { text: piece, fill: theme.graphEdge },
                )
                .filter((segment) => segment.text !== ''),
            ' xml:space="preserve"',
        ),
    ),
];

const evalsPane = ({ evals }: Home['aiWorkflow'], theme: Theme): Line[] => [
    prompt(evals.command, theme),
    ...evals.suites.map(
        (suite): Line => ({
            height: LEADING,
            render: (x, y, width) =>
                `<text x="${x}" y="${y + BASELINE}">${tspans([
                    { text: '✓ ', fill: theme.green },
                    { text: suite.name, fill: theme.paneText },
                ])}</text><text x="${x + width}" y="${y + BASELINE}" text-anchor="end" fill="${theme.subtle}">${escape(suite.check)}</text>`,
        }),
    ),
    text([{ text: `${evals.suites.length} suites passed`, fill: theme.subtle }]),
];

const agentPane = ({ agent }: Home['aiWorkflow'], theme: Theme): Line[] => [
    prompt(`tail -f ${agent.name.toLowerCase()}.log`, theme),
    ...agent.log.map(
        (entry): Line => ({
            height: LEADING,
            render: (x, y) =>
                `<text x="${x}" y="${y + BASELINE}" fill="${theme.blue}">${escape(entry.source)}</text><text x="${x + CHAR * 11}" y="${y + BASELINE}" fill="${theme.paneText}">${escape(entry.event)}</text>`,
        }),
    ),
    {
        height: LEADING,
        render: (x, y) =>
            `<rect class="blink" x="${x}" y="${y + 3}" width="${CHAR}" height="${FONT + 2}" fill="${theme.subtle}"/>`,
    },
];

const paneHeight = (lines: Line[]): number => PAD * 2 + lines.reduce((sum, line) => sum + line.height, 0);

const renderPane = (lines: Line[], x: number, y: number, order: number): string => {
    let top = y + PAD;
    return lines
        .map((line, index) => {
            const svg = `<g class="rise" ${delay(0.2 + order * 0.35 + index * 0.12)}>${line.render(x + PAD, top, PANE_WIDTH - PAD * 2)}</g>`;
            top += line.height;
            return svg;
        })
        .join('\n');
};

/** The site's cmux window: four panes of the AI workflow plus the status bar. */
export const renderTerminal = (home: Home, theme: Theme): string => {
    const workflow = home.aiWorkflow;
    const panes = [
        orchestratePane(workflow, theme),
        graphPane(theme),
        evalsPane(workflow, theme),
        agentPane(workflow, theme),
    ];
    const rowHeights = [
        Math.max(paneHeight(panes[0]), paneHeight(panes[1])),
        Math.max(paneHeight(panes[2]), paneHeight(panes[3])),
    ];
    const rowTops = [TITLE_BAR + 1, TITLE_BAR + 1 + rowHeights[0] + 1];
    const statusTop = rowTops[1] + rowHeights[1] + 1;
    const height = statusTop + STATUS_BAR;
    const mux = workflow.orchestration.mux.toLowerCase();
    const paneNames = ['orchestrate', 'graph', 'evals', workflow.agent.name.toLowerCase()];

    const background = panes
        .map((_, index) => {
            const x = index % 2 === 0 ? 0 : PANE_WIDTH + 1;
            const y = rowTops[Math.floor(index / 2)];
            return `<rect x="${x}" y="${y}" width="${PANE_WIDTH}" height="${rowHeights[Math.floor(index / 2)]}" fill="${theme.pane}"/>`;
        })
        .join('');

    const content = panes
        .map((lines, index) =>
            renderPane(lines, index % 2 === 0 ? 0 : PANE_WIDTH + 1, rowTops[Math.floor(index / 2)], index),
        )
        .join('\n');

    const tabs = paneNames
        .map(
            (name, index) =>
                `<tspan fill="${index === 0 ? theme.text : theme.subtle}">  ${index}:${escape(name)}${index === 0 ? '*' : ''}</tspan>`,
        )
        .join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="title">
<title id="title">${escape(`${workflow.heading}: ${workflow.orchestration.agentCount} agents orchestrated with ${workflow.orchestration.mux}`)}</title>
<defs>
    <style>${motion}
        text { font-family: ${fonts.mono}; font-size: ${FONT}px; }
    </style>
    <clipPath id="frame"><rect width="${WIDTH}" height="${height}" rx="10"/></clipPath>
</defs>
<g clip-path="url(#frame)">
    <rect width="${WIDTH}" height="${height}" fill="${theme.border}"/>
    <rect width="${WIDTH}" height="${TITLE_BAR}" fill="${theme.chrome}"/>
    <circle cx="20" cy="19" r="6" fill="#f87171"/>
    <circle cx="40" cy="19" r="6" fill="#facc15"/>
    <circle cx="60" cy="19" r="6" fill="#4ade80"/>
    <text x="80" y="23" font-size="12" fill="${theme.subtle}">~/workflow — ${escape(mux)}</text>
    ${background}
    <rect y="${statusTop}" width="${WIDTH}" height="${STATUS_BAR}" fill="${theme.chrome}"/>
    <text x="16" y="${statusTop + 21}" font-size="12" xml:space="preserve"><tspan fill="${theme.accent}" font-weight="600">[${escape(mux)}]</tspan>${tabs}</text>
    <text x="${WIDTH - 16}" y="${statusTop + 21}" font-size="12" text-anchor="end" fill="${theme.subtle}">${workflow.orchestration.agentCount} agents · ${workflow.evals.suites.length} suites green</text>
</g>
${content}
<rect x=".5" y=".5" width="${WIDTH - 1}" height="${height - 1}" rx="10" fill="none" stroke="${theme.border}"/>
</svg>
`;
};
