import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { parseSymfonyBadges } from '../generator/sources.ts';

test('parses SymfonyConnect badges and resolves relative URLs', () => {
    const html = `<html><body><div class="profile_public"><ul class="thumbnails">
        <li><a href="/badge/73/ten-year-membership" title="Ten-year membership badge"><img src="https://connect.symfony.com/uploads/badges/ten.png"></a></li>
        <li><a href="/badge/1/hey-you" title="Hey you! badge"><img src="/uploads/badges/hey.png"></a></li>
        <li><a href="/badge/2/broken" title="No image"></a></li>
    </ul></div></body></html>`;
    assert.deepEqual(parseSymfonyBadges(html), [
        {
            name: 'Ten-year membership badge',
            link: 'https://connect.symfony.com/badge/73/ten-year-membership',
            img: 'https://connect.symfony.com/uploads/badges/ten.png',
        },
        {
            name: 'Hey you! badge',
            link: 'https://connect.symfony.com/badge/1/hey-you',
            img: 'https://connect.symfony.com/uploads/badges/hey.png',
        },
    ]);
});
