import * as cheerio from 'cheerio';
import { SITE } from './readme.ts';
import type { Portfolio, SymfonyBadge } from './types.ts';

const SYMFONY_PROFILE = 'https://connect.symfony.com/profile/plopix';

// Override to read a local portfolio (e.g. http://localhost:4321/api); README links still point to SITE.
export const portfolioApi = process.env.PORTFOLIO_API ?? `${SITE}/api`;

const get = async (url: string): Promise<Response> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`GET ${url} → HTTP ${response.status}`);
    }
    return response;
};

const json = async <T>(url: string): Promise<T> => (await get(url)).json() as Promise<T>;

/** Everything the README shows from sebastien.morel.me, via its JSON API. */
export const fetchPortfolio = async (api: string): Promise<Portfolio> => {
    const [me, home, socials, projects, sideProjects, talks, publications, stacks] = await Promise.all([
        json<Portfolio['me']>(`${api}/me.json`),
        json<Portfolio['home']>(`${api}/home.json`),
        json<Portfolio['socials']>(`${api}/socials.json`),
        json<Portfolio['projects']>(`${api}/projects.json`),
        json<Portfolio['sideProjects']>(`${api}/side-projects.json`),
        json<Portfolio['talks']>(`${api}/talks.json`),
        json<Portfolio['publications']>(`${api}/publications.json`),
        json<Portfolio['stacks']>(`${api}/stacks.json`),
    ]);
    return { me, home, socials, projects, sideProjects, talks, publications, stacks };
};

/** Parses the badge list of a SymfonyConnect public profile page. */
export const parseSymfonyBadges = (html: string, base = SYMFONY_PROFILE): SymfonyBadge[] => {
    const $ = cheerio.load(html);
    return $('body .profile_public ul.thumbnails > li > a')
        .toArray()
        .flatMap((element) => {
            const anchor = $(element);
            const img = anchor.find('img').attr('src');
            const href = anchor.attr('href');
            if (!img || !href) {
                return [];
            }
            return [{ name: anchor.attr('title') ?? '', link: new URL(href, base).href, img: new URL(img, base).href }];
        });
};

export const fetchSymfonyBadges = async (): Promise<SymfonyBadge[]> => {
    const badges = parseSymfonyBadges(await (await get(SYMFONY_PROFILE)).text());
    if (badges.length === 0) {
        throw new Error(`No badges found on ${SYMFONY_PROFILE}; the page markup probably changed.`);
    }
    return badges;
};

