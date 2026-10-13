import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { escape, firstSentence, formatMonthYear, formatStamp, inlineHtml, wrap } from '../generator/text.ts';
import { shield } from '../generator/badges.ts';

test('escape neutralises markup and quotes', () => {
    assert.equal(escape(`<a href="x">Tom & Jerry's</a>`), '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;');
});

test('inlineHtml renders bold and code, after escaping', () => {
    assert.equal(
        inlineHtml('a **bold** `PRD.json` <script> & co\n'),
        'a <b>bold</b> <code>PRD.json</code> &lt;script&gt; &amp; co',
    );
});

test('firstSentence keeps dotted names like Chess.com intact', () => {
    assert.equal(firstSentence('Plays on Chess.com and Lichess. Free to play.'), 'Plays on Chess.com and Lichess.');
});

test('wrap breaks on words within the budget', () => {
    assert.deepEqual(wrap('Driving Innovation and accelerating growth through AI-Augmented Tech Leadership.', 52), [
        'Driving Innovation and accelerating growth through',
        'AI-Augmented Tech Leadership.',
    ]);
});

test('formatMonthYear ignores the local timezone', () => {
    assert.equal(formatMonthYear('2025-09-23T00:00:00.000Z'), 'Sep 2025');
    assert.equal(formatMonthYear('2026-06-01'), 'Jun 2026');
});

test('formatStamp uses Pacific time in the historical format', () => {
    assert.equal(formatStamp(new Date('2024-12-08T01:06:24Z')), '12-07-2024 17:06:24');
});

test('shield escapes shields.io separators', () => {
    assert.equal(
        shield({ label: 'Updated on', message: '12-07-2024 17:06:24', color: 'green' }),
        'https://img.shields.io/badge/Updated%20on-12--07--2024%2017%3A06%3A24-green?style=flat-square&labelColor=black',
    );
    assert.equal(
        shield({ label: 'snake_case', logo: 'github' }),
        'https://img.shields.io/badge/snake__case-black?style=flat-square&logo=github',
    );
});
