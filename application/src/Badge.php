<?php

declare(strict_types=1);

namespace App;

use ConvenientImmutability\Immutable;

final class Badge
{
    use Immutable {
        Immutable::__construct as private __immutable;
    }

    public string $label;
    public string $style;
    public ?string $logo;
    public ?string $message;
    public string $color;
    public string $labelColor;
    public ?string $link;
    public string $source;

    public function __construct(array $config)
    {
        $this->__immutable();
        $this->label = $config['label'] ?? 'unknown';
        $this->style = $config['style'] ?? 'flat-square';
        $this->logo = $config['logo'] ?? null;
        $this->message = $config['message'] ?? null;
        $this->color = $config['color'] ?? 'green';
        $this->labelColor = $config['labelColor'] ?? 'black';
        $this->link = $config['link'] ?? null;
        $this->source = $config['source'] ?? 'shields.io';
    }
}
