<?php

declare(strict_types=1);

namespace App\Contentful\Renderer;

use App\Badge;
use Contentful\Delivery\Resource\Entry;
use Contentful\RichText\Node\EmbeddedEntryInline as BaseEmbeddedEntryInline;
use Contentful\RichText\Node\NodeInterface;
use Contentful\RichText\NodeRenderer\NodeRendererInterface;
use Contentful\RichText\RendererInterface;

class EmbeddedEntryInline implements NodeRendererInterface
{
    public function supports(NodeInterface $node): bool
    {
        return $node instanceof BaseEmbeddedEntryInline;
    }

    public function render(RendererInterface $renderer, NodeInterface $node, array $context = []): string
    {
        /** @var BaseEmbeddedEntryInline $node */

        /** @var \Contentful\Delivery\Resource\ContentType $contentType */
        $contentType = $node->getEntry()->getContentType();

        /** @var Entry $entry */
        $entry = $node->getEntry();
        if ('badge' === $contentType->getId()) {
            return $this->renderShieldsIOBadge(new Badge($entry));
        }

        if ('company' === $contentType->getId()) {
            return $this->renderCompany($entry);
        }

        return $renderer->render($node);
    }

    private function renderCompany(Entry $company): string
    {
        return "<a target='_blank' href='{$company->get('url')}' title='{$company->get('name')}'>{$company->get('name')}</a>";
    }

    private function renderShieldsIOBadge(Badge $badge): string
    {
        $alt = $badge->label.(null !== $badge->message ? ' - '.$badge->message : '');
        $urlAlt = str_replace(' - ', '-', $alt);

        $url = "https://img.shields.io/badge/{$urlAlt}-".
               (null !== $badge->message ? $badge->color : $badge->labelColor).
               "?style={$badge->style}&logo={$badge->logo}";
        if (null !== $badge->message) {
            $url .= "&labelColor={$badge->labelColor}";
        }

        if ($badge->link !== null) {
            return "<a href='{$badge->link}' target='_blank'><img src='{$url}' alt='{$alt}'/></a>";
        }

        return "<img src='{$url}' alt='{$alt}'/>";
    }
}
