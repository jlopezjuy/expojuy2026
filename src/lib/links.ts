/**
 * Resolve a link href for a multipage site.
 *
 * The one-page sections only exist on the home page (see the section ids in
 * src/components/sections). Their in-page anchors (`#la-expo`, `#territorios`,
 * `#emprendimientos`, `#participar`) must stay as same-page scrolls when the
 * link is rendered on "/", but must route through "/" when rendered on any
 * other page — otherwise the click is a silent no-op.
 */
export function resolveHref(href: string, pathname: string): string {
  if (href.startsWith('#') && pathname !== '/') {
    return `/${href}`;
  }
  return href;
}
