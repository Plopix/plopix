<?php

declare(strict_types=1);

namespace App\Twig;

use App\Badge;
use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;

final class BadgeExtension extends AbstractExtension
{
    private array $configuration;

    public function __construct(array $configuration)
    {
        $this->configuration = $configuration;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'badge',
                [$this, 'renderBadge'],
                [
                    'is_safe' => ['html'],
                    'needs_environment' => false
                ]
            ),
        ];
    }

    public function renderBadge(string $key): string
    {
        if (!\array_key_exists($key, $this->configuration)) {
            return '';
        }

        $badge = new Badge($this->configuration[$key]);

        if ($badge->source !== 'shields.io') {
            return '';
        }

        if ($badge->link != null) {
            return "<a href='{$badge->link}'>{$this->renderShieldsIOBadge($badge)}</a>";
        }

        return $this->renderShieldsIOBadge($badge);
    }

    private function renderShieldsIOBadge(Badge $badge): string
    {
        $alt = $badge->label.($badge->message !== null ? ' - '.$badge->message : '');
        $urlAlt = str_replace(' - ', '-', $alt);

        $url = "https://img.shields.io/badge/{$urlAlt}-".
               ($badge->message !== null ? $badge->color : $badge->labelColor).
               "?style={$badge->style}&logo={$badge->logo}";
        if ($badge->message !== null) {
            $url .= "&labelColor={$badge->labelColor}";
        }

        return "<img src='{$url}' alt='{$alt}'/>";
    }

}
