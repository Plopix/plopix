import { resolve } from 'node:path';
import { assets, renderReadme, SITE } from './readme.ts';
import { fetchPortfolio, fetchSymfonyBadges, portfolioApi } from './sources.ts';
import { renderHero } from './svg/hero.ts';
import { renderTerminal } from './svg/terminal.ts';
import { themes } from './svg/theme.ts';

const root = resolve(import.meta.dir, '..');

const [portfolio, symfonyBadges] = await Promise.all([fetchPortfolio(portfolioApi), fetchSymfonyBadges()]);

// Render everything before writing anything, so a failure leaves the repository untouched.
const files: Record<string, string> = {
    'README.md': renderReadme({ ...portfolio, symfonyBadges, updatedAt: new Date() }),
};
for (const theme of Object.values(themes)) {
    files[assets.hero[theme.name]] = renderHero({ me: portfolio.me, home: portfolio.home, site: SITE }, theme);
    files[assets.terminal[theme.name]] = renderTerminal(portfolio.home, theme);
}

for (const [path, content] of Object.entries(files)) {
    // Bun.write creates missing parent directories.
    await Bun.write(resolve(root, path), content);
    console.log(`wrote ${path}`);
}
