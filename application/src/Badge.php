<?php

declare(strict_types=1);

namespace App;

use Contentful\Delivery\Resource\Entry;
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

    public function __construct(Entry $config)
    {
        $this->__immutable();
        $this->label = $config->get('label') ?? 'unknown';
        $this->style = $config->get('style') ?? 'flat-square';
        $this->logo = $config->get('logo') ?? null;
        $this->message = $config->get('message') ?? null;
        $this->color = $config->get('color') ?? 'green';
        $this->labelColor = $config->get('labelColor') ?? 'black';
        $this->link = $config->get('link') ?? null;
        $this->source = 'shields.io';
    }
}
