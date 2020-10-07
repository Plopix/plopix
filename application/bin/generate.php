<?php
declare(strict_types=1);

use App\SymfonyBadgeFetcher;
use Twig\Environment;

include __DIR__."/../bootstrap.php";

/** @var Environment $twig */
$template = $twig->load('README.md.twig');

$symfonyBadges = (new SymfonyBadgeFetcher())();
/** @var Contentful\Delivery\Client\ClientInterface $contentfulClient */

print $template->render(
    [
        'symfonyBadges' => $symfonyBadges,
        'readme' => $contentfulClient->getEntry('6DG8ize9qQjLUBTTiSrgqg')
    ]
);
