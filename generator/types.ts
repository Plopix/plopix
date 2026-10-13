/**
 * Shapes of the sebastien.morel.me JSON API (`/api/*.json`), limited to the
 * fields the README uses. The portfolio repository owns the full contracts.
 */

export type Me = {
    firstName: string;
    lastName: string;
    company: string;
    jobTitle: string;
    companyUrl: string;
};

export type Home = {
    headline: string;
    focusAreas: string[];
    bio: { intro: string; outro: string };
    aiWorkflow: {
        heading: string;
        orchestration: {
            agentCount: number;
            agents: string[];
            mux: string;
            loop: string;
            runtime: string;
        };
        evals: {
            command: string;
            suites: { name: string; check: string }[];
        };
        agent: {
            name: string;
            log: { source: string; event: string }[];
        };
        cards: { title: string; description: string }[];
        tagline: string;
    };
};

export type SocialGroup = {
    title: string;
    items: { name: string; username: string; url: string }[];
};

export type Project = {
    title: string;
    repositoryName: string;
    packagePlatform: string;
    packagePlatformId: string;
    baseline: string;
    description: string;
    urlDocumentation?: string | null;
    roles: string[];
    repositoryOrganization: { name: string; type: string };
};

export type SideProject = {
    title: string;
    description: string;
    role: string;
    timeline: string;
    url: string;
    technologies: string[];
};

export type Talk = {
    title: string;
    date: string;
    event?: { name: string; url?: string };
    location?: string;
    video?: string;
    /** Path on sebastien.morel.me, e.g. /slides/ezconf-2018.pdf */
    slides?: string;
};

export type Publication = {
    title: string;
    publishedAt: string;
    publisher?: { name: string; canonical: string };
};

export type Stack = {
    title: string;
    technologies: { name: string }[];
};

export type Portfolio = {
    me: Me;
    home: Home;
    socials: SocialGroup[];
    projects: { current: Project[]; legacy: Project[] };
    sideProjects: SideProject[];
    talks: { upcoming: Talk[]; past: Talk[] };
    publications: Publication[];
    stacks: Stack[];
};

export type SymfonyBadge = {
    name: string;
    link: string;
    img: string;
};

export type ReadmeData = Portfolio & {
    symfonyBadges: SymfonyBadge[];
    updatedAt: Date;
};
