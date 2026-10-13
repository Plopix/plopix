import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { renderHero } from '../generator/svg/hero.ts';
import { renderTerminal, wrapSegments } from '../generator/svg/terminal.ts';
import { themes } from '../generator/svg/theme.ts';
import { fetchPortfolio, portfolioApi } from '../generator/sources.ts';
import { escape, wrap } from '../generator/text.ts';

// Rendered from the live portfolio API, like the generator does.
const { me, home } = await fetchPortfolio(portfolioApi);

const hero = (theme = themes.dark, content = home) =>
    renderHero({ me, home: content, site: 'https://sebastien.morel.me' }, theme);

/** Every `&` must start an entity, or the SVG is not valid XML and will not render. */
const assertEscaped = (svg: string) => assert.doesNotMatch(svg, /&(?!amp;|lt;|gt;|quot;|#39;)/);

test('hero carries the role, wrapped headline and focus areas, but no avatar or name', () => {
    const svg = hero();
    assert.ok(!svg.includes('<image'));
    assert.ok(!svg.includes(escape(me.lastName)));
    assert.ok(svg.includes(`${escape(me.jobTitle)} @ <tspan`));
    for (const line of wrap(home.headline, 34)) {
        assert.ok(svg.includes(`>${escape(line)}</text>`), line);
    }
    for (const area of home.focusAreas) {
        assert.ok(svg.includes(`<tspan>${escape(area)}</tspan>`), area);
    }
    assertEscaped(svg);
});

test('hero grows with the headline and escapes its text', () => {
    const long = hero(themes.dark, { ...home, headline: `${home.headline} Tom & Jerry <3 `.repeat(2) });
    const height = (svg: string) => Number(/height="(\d+)"/.exec(svg)?.[1]);
    assert.ok(height(long) > height(hero()));
    assertEscaped(long);
});

test('terminal shows all four panes', () => {
    const svg = renderTerminal(home, themes.light);
    const { orchestration, evals, agent } = home.aiWorkflow;
    assert.ok(svg.includes(`orchestrate --agents x${orchestration.agentCount}`));
    for (const name of orchestration.agents) {
        assert.ok(svg.includes(`>${escape(name)}</text>`), name);
    }
    assert.ok(svg.includes('>graph run prd.json<'));
    for (const suite of evals.suites) {
        assert.ok(svg.includes(escape(suite.name)), suite.name);
    }
    assert.ok(svg.includes(`tail -f ${escape(agent.name.toLowerCase())}.log`));
    for (const entry of agent.log) {
        assert.ok(svg.includes(`>${escape(entry.event)}</text>`), entry.event);
    }
    assert.ok(svg.includes('0:orchestrate*'));
    assertEscaped(svg);
});

test('light and dark variants differ only by palette', () => {
    const light = renderTerminal(home, themes.light);
    const dark = renderTerminal(home, themes.dark);
    assert.notEqual(light, dark);
    assert.equal(light.replace(/#[0-9a-f]{6}/g, ''), dark.replace(/#[0-9a-f]{6}/g, ''));
});

test('wrapSegments wraps on words and keeps styles', () => {
    const lines = wrapSegments(
        [
            { text: 'CMUX', fill: 'a', bold: true },
            { text: 'managing shells · custom', fill: 'b' },
            { text: 'RALPH loop', fill: 'a', bold: true },
        ],
        20,
    );
    assert.deepEqual(
        lines.map((line) => line.map((segment) => segment.text).join('')),
        ['CMUX managing shells', '· custom RALPH loop'],
    );
    assert.equal(lines[1].at(-1)?.fill, 'a');
});
