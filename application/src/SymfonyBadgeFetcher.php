<?php

declare(strict_types=1);

namespace App;

use RuntimeException;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\HttpClient\HttpClient;

final class SymfonyBadgeFetcher
{
    private const URL = 'https://connect.symfony.com/profile/plopix';

    public function __invoke(): array
    {
        $client = HttpClient::create();
        $response = $client->request('GET', self::URL);
        if ($response->getStatusCode() !== 200) {
            throw new RuntimeException("Profile page not available.");
        }
        $content = $response->getContent();
        $crawler = new Crawler($content);

        $bagdes = [];
        $list = $crawler->filter("body .profile_public ul.thumbnails > li");

        foreach ($list as $item) {

            $link = $item->firstChild;
            $bagdes[] = [
                'name' => $link->attributes->getNamedItem('title')->nodeValue,
                'link' => 'https://connect.symfony.com'.$link->attributes->getNamedItem('href')->nodeValue,
                'img' => $link->firstChild->attributes->getNamedItem('src')->nodeValue
            ];
        }

        return $bagdes;
    }
}
