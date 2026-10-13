import { escape } from './text.ts';

// LinkedIn is no longer in simple-icons, so shields.io gets the glyph inline.
const linkedinLogo = `data:image/svg+xml;base64,${Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
).toString('base64')}`;

/**
 * Technology / network name (as written on sebastien.morel.me) → shields.io logo.
 * Names without an entry render as plain badges; slugs were checked against
 * shields.io, which dropped some brands (AWS, OpenAI, Varnish…).
 */
export const logos: Record<string, string> = {
    'Claude Code': 'claude',
    'Vercel AI SDK': 'vercel',
    Cloudflare: 'cloudflare',
    'Hono JS': 'hono',
    Bun: 'bun',
    'React Router v7': 'reactrouter',
    Astro: 'astro',
    Meilisearch: 'meilisearch',
    'Nest JS': 'nestjs',
    MongoDB: 'mongodb',
    'Next.JS': 'nextdotjs',
    Typescript: 'typescript',
    PostgreSQL: 'postgresql',
    Redis: 'redis',
    SQLite: 'sqlite',
    'React JS': 'react',
    'Tailwind CSS': 'tailwindcss',
    Docker: 'docker',
    Git: 'git',
    Github: 'github',
    GitHub: 'github',
    RabbitMQ: 'rabbitmq',
    Algolia: 'algolia',
    Shell: 'gnubash',
    Makefile: 'gnu',
    PHP: 'php',
    Symfony: 'symfony',
    MySQL: 'mysql',
    Solr: 'apachesolr',
    'Platform SH': 'platformdotsh',
    Travis: 'travisci',
    Swift: 'swift',
    Ansible: 'ansible',
    Linkedin: linkedinLogo,
    'Twitter/X': 'x',
    Bluesky: 'bluesky',
    Discord: 'discord',
    'Chess.com': 'chessdotcom',
};

// Static badge path segments: "-" and "_" are separators, so they are doubled.
const segment = (value: string): string => encodeURIComponent(value.replaceAll('-', '--').replaceAll('_', '__'));

type Shield = {
    label: string;
    message?: string;
    color?: string;
    logo?: string;
};

/** URL of a flat-square shields.io static badge, black by default. */
export const shield = ({ label, message, color = 'black', logo }: Shield): string => {
    const path = [label, message, color].filter((part) => part !== undefined).map((part) => segment(part as string));
    const query = new URLSearchParams({ style: 'flat-square' });
    if (logo) {
        query.set('logo', logo);
    }
    if (message !== undefined) {
        query.set('labelColor', 'black');
    }
    return `https://img.shields.io/badge/${path.join('-')}?${query}`;
};

export const image = (src: string, alt: string): string => `<img src="${escape(src)}" alt="${escape(alt)}"/>`;

export const link = (href: string, content: string): string => `<a href="${escape(href)}">${content}</a>`;

/** A named badge (technology, network…) with its logo when one is known. */
export const named = (name: string, href?: string): string => {
    const badge = image(shield({ label: name, logo: logos[name] }), name);
    return href ? link(href, badge) : badge;
};
