<?php
declare(strict_types=1);

use App\SymfonyBadgeFetcher;

include __DIR__."/../bootstrap.php";

$template = $twig->load('README.md.twig');

$symfonyBadges = (new SymfonyBadgeFetcher())();

print $template->render(['symfonyBadges' => $symfonyBadges]);
