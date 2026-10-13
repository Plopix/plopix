/** Escapes text for HTML/XML content and attribute values. */
export const escape = (value: string): string =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

/**
 * Renders the portfolio's inline Markdown (**bold**, `code`) to HTML, for spots
 * where GitHub does not parse Markdown (inside HTML blocks such as tables).
 */
export const inlineHtml = (markdown: string): string =>
    escape(markdown.trim())
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/`(.+?)`/g, '<code>$1</code>');

/** First sentence of a paragraph, used to keep long descriptions to one line. */
export const firstSentence = (text: string): string => text.trim().split(/(?<=[.!?])\s+/)[0];

/** Greedy word wrap on an approximate character budget. */
export const wrap = (text: string, maxChars: number): string[] => {
    const lines: string[] = [];
    let line = '';
    for (const word of text.trim().split(/\s+/)) {
        if (line && line.length + 1 + word.length > maxChars) {
            lines.push(line);
            line = word;
        } else {
            line = line ? `${line} ${word}` : word;
        }
    }
    if (line) {
        lines.push(line);
    }
    return lines;
};

const monthYear = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "2025-09-23" → "Sep 2025" */
export const formatMonthYear = (date: string): string => monthYear.format(new Date(date));

/** Same stamp format the README has always used: MM-DD-YYYY HH:mm:ss, Pacific time. */
export const formatStamp = (date: Date): string => {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Los_Angeles',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        })
            .formatToParts(date)
            .map((part) => [part.type, part.value]),
    );
    return `${parts.month}-${parts.day}-${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
};
