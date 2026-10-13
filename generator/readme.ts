import type { Project, ReadmeData, SideProject, Stack, Talk } from './types.ts';
import { image, link, named, shield } from './badges.ts';
import { escape, firstSentence, formatMonthYear, formatStamp, inlineHtml } from './text.ts';

export const SITE = 'https://sebastien.morel.me';

/** SVGs written next to the README, one per theme. */
export const assets = {
    hero: { light: 'assets/hero-light.svg', dark: 'assets/hero-dark.svg' },
    terminal: { light: 'assets/terminal-light.svg', dark: 'assets/terminal-dark.svg' },
};

const LATEST = 4;
// Stack groups after this many go into a collapsed "earlier stack" block.
const CURRENT_STACKS = 4;
// Presentational icons paired with home.aiWorkflow.cards by index, like the site's.
const CARD_ICONS = ['🕸️', '🛠️', '🔌', '🔔', '🌳'];

/**
 * Theme-aware image. Every tag sits on its own line: GitHub only treats the
 * block as HTML when its first line is a lone tag, otherwise it mangles <picture>.
 */
const picture = (
    sources: { light: string; dark: string },
    alt: string,
    { href, fullWidth = true }: { href?: string; fullWidth?: boolean } = {},
): string =>
    [
        ...(href ? [`<a href="${escape(href)}">`] : []),
        '<picture>',
        `  <source media="(prefers-color-scheme: dark)" srcset="${escape(sources.dark)}">`,
        `  <img alt="${escape(alt)}" src="${escape(sources.light)}"${fullWidth ? ' width="100%"' : ''}>`,
        '</picture>',
        ...(href ? ['</a>'] : []),
    ].join('\n');

const local = (sources: { light: string; dark: string }) => ({
    light: `./${sources.light}`,
    dark: `./${sources.dark}`,
});

/** Two-column HTML table; an odd first item spans the row, as on the site. */
const grid = (cells: string[], { spanFirst = false } = {}): string => {
    const rows: string[] = [];
    let rest = cells;
    if (spanFirst && cells.length % 2 === 1) {
        rows.push(`<tr><td colspan="2" valign="top">${cells[0]}</td></tr>`);
        rest = cells.slice(1);
    }
    for (let index = 0; index < rest.length; index += 2) {
        const pair = rest.slice(index, index + 2);
        rows.push(`<tr>${pair.map((cell) => `<td width="50%" valign="top">${cell}</td>`).join('')}</tr>`);
    }
    return `<table>\n${rows.join('\n')}\n</table>`;
};

const hero = ({ me, home }: ReadmeData): string =>
    picture(local(assets.hero), `${me.jobTitle} @ ${me.company}. ${home.headline}`, { href: SITE });

const socials = ({ socials }: ReadmeData): string => {
    const badges = socials
        .flatMap((group) => group.items)
        // This page is already on GitHub.
        .filter((item) => item.name.toLowerCase() !== 'github')
        .map((item) => named(item.name, item.url));
    badges.push(link(SITE, image(shield({ label: new URL(SITE).host, color: 'ff9900' }), 'Website')));
    return `<p align="center">\n${badges.join('\n')}\n</p>`;
};

const bio = ({ home }: ReadmeData): string => `${home.bio.intro}\n\n_${home.bio.outro}_`;

const aiWorkflow = ({ home }: ReadmeData): string => {
    const { heading, orchestration, cards, tagline } = home.aiWorkflow;
    const cells = cards.map(
        (card, index) => `${CARD_ICONS[index] ?? '✨'} <b>${escape(card.title)}</b><br/>${inlineHtml(card.description)}`,
    );
    return [
        `## 🤖 ${heading}`,
        picture(
            local(assets.terminal),
            `Terminal: ${orchestration.agentCount} agents (${orchestration.agents.join(', ')}) orchestrated with ${orchestration.mux} and a custom ${orchestration.loop}.`,
        ),
        grid(cells, { spanFirst: true }),
        `<p align="center">${inlineHtml(tagline)}</p>`,
    ].join('\n\n');
};

const repositoryUrl = (project: Project): string =>
    `https://github.com/${project.repositoryOrganization.name}/${project.repositoryName}`;

const projectCell = (project: Project): string => {
    const repository = `${project.repositoryOrganization.name}/${project.repositoryName}`;
    const badges = [
        link(
            repositoryUrl(project),
            image(
                `https://img.shields.io/github/stars/${repository}?style=flat-square&logo=github&labelColor=black&color=ff9900`,
                `${project.title} GitHub stars`,
            ),
        ),
    ];
    if (project.packagePlatform === 'npm') {
        badges.push(
            link(
                `https://www.npmjs.com/package/${project.packagePlatformId}`,
                image(
                    `https://img.shields.io/npm/v/${project.packagePlatformId}?style=flat-square&logo=npm&labelColor=black&color=ff9900`,
                    `${project.title} on npm`,
                ),
            ),
        );
    }
    return [
        `<b>${link(project.urlDocumentation ?? repositoryUrl(project), escape(project.title))}</b> <sub>${escape(project.roles.join(' · '))}</sub>`,
        `<i>${escape(project.baseline)}</i>`,
        `<sub>${escape(project.description)}</sub>`,
        `<br/>${badges.join(' ')}`,
    ].join('<br/>\n');
};

const openSource = ({ projects }: ReadmeData): string =>
    [
        '## 🧩 Open Source',
        grid(projects.current.map(projectCell)),
        [
            '<details>',
            '  <summary>🕰️ Legacy projects</summary><br/>',
            '',
            ...projects.legacy.map(
                (project) =>
                    `- [${project.title}](${project.urlDocumentation ?? repositoryUrl(project)}) — ${project.baseline}`,
            ),
            '</details>',
        ].join('\n'),
    ].join('\n\n');

const sideProjectCell = (project: SideProject): string =>
    [
        `<b>${link(project.url, escape(project.title))}</b>`,
        `<sub>${escape(`${project.role} · ${project.timeline}`)}</sub>`,
        escape(firstSentence(project.description)),
        `<sub>${project.technologies.map((technology) => `<code>${escape(technology)}</code>`).join(' ')}</sub>`,
    ].join('<br/>\n');

const sideProjects = ({ sideProjects }: ReadmeData): string =>
    [`## 🚀 Side Projects`, grid(sideProjects.map(sideProjectCell))].join('\n\n');

const entry = (title: string, href: string, meta: string[]): string =>
    `<b>${link(href, escape(title.trim()))}</b><br/><sub>${escape(meta.join(' · '))}</sub>`;

/** Recording first, then the slides hosted on the site, then the event page. */
export const talkUrl = (talk: Talk): string =>
    talk.video ?? (talk.slides ? new URL(talk.slides, SITE).href : (talk.event?.url ?? `${SITE}/talks`));

const talkMeta = (talk: Talk): string[] =>
    [formatMonthYear(talk.date), talk.event?.name, talk.location].filter((part): part is string => Boolean(part));

const latest = ({ publications, talks }: ReadmeData): string => {
    const posts = publications
        .slice(0, LATEST)
        .map((post) =>
            entry(post.title, post.publisher?.canonical ?? `${SITE}/publications`, [
                formatMonthYear(post.publishedAt),
                ...(post.publisher ? [post.publisher.name] : []),
            ]),
        );
    const lives = talks.past.slice(0, LATEST).map((talk) => entry(talk.title, talkUrl(talk), talkMeta(talk)));
    return [
        '## ✍️ Latest publications & talks',
        [
            '<table>',
            '<tr><th width="50%">📝 Publications</th><th width="50%">🎤 Talks & livestreams</th></tr>',
            `<tr><td valign="top">${posts.join('<br/><br/>\n')}</td><td valign="top">${lives.join('<br/><br/>\n')}</td></tr>`,
            `<tr><td align="right">${link(`${SITE}/publications`, 'All publications →')}</td><td align="right">${link(`${SITE}/talks`, 'All talks & livestreams →')}</td></tr>`,
            '</table>',
        ].join('\n'),
    ].join('\n\n');
};

const stackTable = (stacks: Stack[]): string =>
    [
        '<table>',
        ...stacks.map(
            (stack) =>
                `<tr><td><b>${escape(stack.title)}</b></td><td>${stack.technologies.map((technology) => named(technology.name)).join(' ')}</td></tr>`,
        ),
        '</table>',
    ].join('\n');

const stack = ({ stacks }: ReadmeData): string =>
    [
        '## 🧰 Stack',
        stackTable(stacks.slice(0, CURRENT_STACKS)),
        ...(stacks.length > CURRENT_STACKS
            ? [
                  [
                      '<details>',
                      '  <summary>🦕 Earlier stack</summary><br/>',
                      '',
                      stackTable(stacks.slice(CURRENT_STACKS)),
                      '</details>',
                  ].join('\n'),
              ]
            : []),
    ].join('\n\n');

const statsUrl = (theme: string): string =>
    `https://github-readme-stats.vercel.app/api?username=plopix&count_private=true&show_icons=true&hide_title=true${theme}`;

const stats = ({ symfonyBadges }: ReadmeData): string =>
    [
        '## 📊 Stats & badges',
        '<a href="https://github.com/sponsors/plopix"><img align="right" src="https://github.githubassets.com/images/modules/site/sponsors/logo-mona.svg" alt="Mona holding a heart" width="180"/></a>',
        picture(
            {
                light: statsUrl('&border_color=e5e5e5&text_color=525252&icon_color=ff9900&ring_color=ff9900'),
                dark: statsUrl('&bg_color=171717&border_color=404040&text_color=d4d4d4&icon_color=ff9900&ring_color=ff9900'),
            },
            "Plopix's GitHub stats",
            { href: 'https://github.com/plopix', fullWidth: false },
        ),
        [
            '<details>',
            '  <summary>💯 More Stats</summary><br/>',
            `  <img width="400" alt="Plopix's Wakatime Languages" src="https://wakatime.com/share/@plopix/9548f056-f696-41fe-8266-b025f19192c6.svg"/>`,
            `  <img width="400" alt="Plopix's Wakatime Times" src="https://wakatime.com/share/@plopix/91750824-23bb-417c-9e17-d9ee0869eda2.svg"/>`,
            '</details>',
        ].join('\n'),
        [
            '<details>',
            '  <summary>🎼 My Symfony Badges</summary><br/>',
            ...symfonyBadges.map(
                (badge) =>
                    `  <a href="${escape(badge.link)}"><img width="100" src="${escape(badge.img)}" alt="${escape(badge.name)}"/></a>`,
            ),
            '</details>',
        ].join('\n'),
    ].join('\n\n');

const footer = ({ updatedAt }: ReadmeData): string => {
    const stamp = formatStamp(updatedAt);
    return [
        `<p align="center">${link(SITE, `<b>More on ${new URL(SITE).host} →</b>`)}</p>`,
        `<img align="right" src="${escape(shield({ label: 'Updated on', message: stamp, color: 'green' }))}" alt="Updated on ${stamp}"/>`,
    ].join('\n\n');
};

export const renderReadme = (data: ReadmeData): string =>
    [
        `<!-- Generated by generator/cli.ts from ${SITE}/api: change the portfolio, not this file. -->`,
        hero(data),
        socials(data),
        bio(data),
        aiWorkflow(data),
        openSource(data),
        sideProjects(data),
        latest(data),
        stack(data),
        stats(data),
        footer(data),
    ].join('\n\n') + '\n';
