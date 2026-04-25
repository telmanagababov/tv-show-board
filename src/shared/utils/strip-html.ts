/**
 * Plain-text extraction from HTML strings.
 *
 * Domain-agnostic, dependency-free, DOM-free. Safe to use in any environment
 * (browser, jsdom, Node).
 *
 * NOT a security boundary. Anything rendered as HTML still needs sanitization
 * at the render site (e.g. DOMPurify before `v-html`).
 */

/** Remove anything that looks like an HTML tag. */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Decode the small set of HTML entities the app actually encounters.
 * `&amp;` is decoded last so escaped entities (`&amp;lt;` → `&lt;`) survive.
 */
export function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

/**
 * Convert HTML to plain text: strip tags, decode entities, collapse runs of
 * whitespace, trim. Suitable for card summaries, meta descriptions, and any
 * place an HTML fragment needs a text-only fallback.
 */
export function stripHtml(html: string): string {
  return decodeHtmlEntities(stripHtmlTags(html)).replace(/\s+/g, ' ').trim()
}
