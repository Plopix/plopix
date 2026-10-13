import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { renderReadme, SITE, talkUrl } from '../generator/readme.ts';
import { fetchPortfolio, portfolioApi } from '../generator/sources.ts';
import { escape } from '../generator/text.ts';
import type { ReadmeData } from '../generator/types.ts';

// Rendered from the live portfolio API, like the generator does.
const data: ReadmeData = {
    ...(await fetchPortfolio(portfolioApi)),
    symfonyBadges: [
        {
            name: 'Ten-year membership badge',
            link: 'https://connect.symfony.com/badge/73/ten-year-membership',
            img: 'https://connect.symfony.com/uploads/badges/ten.png',
        },
    ],
    // 2024-12-07 17:06:24 in Los Angeles.
    updatedAt: new Date('2024-12-08T01:06:24Z'),
};
const readme = renderReadme(data);

test('hero and terminal are theme-aware pictures of the generated SVGs', () => {
    assert.match(readme, /srcset="\.\/assets\/hero-dark\.svg"[\s\S]*src="\.\/assets\/hero-light\.svg"/);
    assert.match(readme, /srcset="\.\/assets\/terminal-dark\.svg"[\s\S]*src="\.\/assets\/terminal-light\.svg"/);
    assert.ok(readme.includes(escape(data.home.headline)));
});

test('links every social network except GitHub, plus the website', () => {
    const row = /<p align="center">\n([\s\S]*?)\n<\/p>/.exec(readme)?.[1] ?? '';
    for (const item of data.socials.flatMap((group) => group.items)) {
        assert.equal(row.includes(`href="${escape(item.url)}"`), item.name.toLowerCase() !== 'github', item.name);
    }
    assert.ok(row.includes(`<a href="${SITE}"><img src="https://img.shields.io/badge/sebastien.morel.me-ff9900`));
});

test('keeps the bio Markdown as-is', () => {
    assert.ok(readme.includes(data.home.bio.intro));
    assert.ok(readme.includes(`_${data.home.bio.outro}_`));
});

test('renders capability cards as HTML, an odd first one spanning both columns', () => {
    const { cards } = data.home.aiWorkflow;
    for (const card of cards) {
        assert.ok(readme.includes(`<b>${escape(card.title)}</b>`), card.title);
    }
    assert.equal(readme.includes('<tr><td colspan="2" valign="top">'), cards.length % 2 === 1);
    assert.ok(!/<td[^>]*>[^<]*\*\*/.test(readme), 'no raw Markdown left inside table cells');
});

test('leaves out the production agent summary, which the visible homepage does not show either', () => {
    assert.ok(!readme.includes('In production'));
});

test('open source projects link docs, stars and npm', () => {
    for (const project of data.projects.current) {
        const repository = `${project.repositoryOrganization.name}/${project.repositoryName}`;
        const href = project.urlDocumentation ?? `https://github.com/${repository}`;
        assert.ok(readme.includes(`<a href="${escape(href)}">${escape(project.title)}</a>`), project.title);
        assert.ok(readme.includes(`https://img.shields.io/github/stars/${repository}?`), project.title);
        const npm = `https://www.npmjs.com/package/${project.packagePlatformId}`;
        assert.equal(readme.includes(npm), project.packagePlatform === 'npm', project.title);
    }
    for (const project of data.projects.legacy) {
        assert.ok(readme.includes(`- [${project.title}](`), project.title);
    }
});

test('links every side project', () => {
    for (const project of data.sideProjects) {
        assert.ok(readme.includes(`<a href="${escape(project.url)}">${escape(project.title)}</a>`), project.title);
    }
});

test('shows the four latest publications and talks', () => {
    for (const post of data.publications.slice(0, 4)) {
        const href = post.publisher?.canonical ?? `${SITE}/publications`;
        assert.ok(readme.includes(`<a href="${escape(href)}">${escape(post.title.trim())}</a>`), post.title);
    }
    for (const talk of data.talks.past.slice(0, 4)) {
        assert.ok(readme.includes(`href="${escape(talkUrl(talk))}"`), talk.title);
    }
});

test('talks without a recording link to their slides, then their event', () => {
    const base = { title: 'Talk', date: '2020-01-01' };
    assert.equal(talkUrl({ ...base, video: 'https://youtu.be/x', slides: '/slides/x.pdf' }), 'https://youtu.be/x');
    assert.equal(talkUrl({ ...base, slides: '/slides/x.pdf' }), `${SITE}/slides/x.pdf`);
    assert.equal(talkUrl({ ...base, event: { name: 'Meetup', url: 'https://x.dev' } }), 'https://x.dev');
    assert.equal(talkUrl(base), `${SITE}/talks`);
    // An event-less talk still renders.
    const lonely = renderReadme({ ...data, talks: { upcoming: [], past: [{ ...base, slides: '/slides/x.pdf' }] } });
    assert.ok(lonely.includes(`<a href="${SITE}/slides/x.pdf">Talk</a>`));
});

test('every technology gets a badge, older stack groups are collapsed', () => {
    for (const technology of data.stacks.flatMap((stack) => stack.technologies)) {
        assert.ok(readme.includes(`alt="${escape(technology.name)}"`), technology.name);
    }
    if (data.stacks.length > 4) {
        const earlier = readme.indexOf('Earlier stack');
        assert.ok(earlier > readme.indexOf(`<b>${escape(data.stacks[3].title)}</b>`));
        assert.ok(earlier < readme.indexOf(`<b>${escape(data.stacks[4].title)}</b>`));
    }
});

test('keeps stats, Symfony badges and the update stamp', () => {
    assert.ok(readme.includes('github-readme-stats.vercel.app/api?username=plopix'));
    assert.ok(readme.includes('wakatime.com/share/@plopix'));
    assert.ok(readme.includes('<a href="https://connect.symfony.com/badge/73/ten-year-membership">'));
    assert.ok(readme.includes('alt="Updated on 12-07-2024 17:06:24"'));
});
