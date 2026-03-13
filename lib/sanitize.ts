import sanitizeHtml from 'sanitize-html';

export function sanitizeHtmlString(html: string): string {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'blockquote', 'code', 'pre'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      'a': (tagName, attribs) => {
        const href = attribs.href || '';
        const safeHref = (href.startsWith('http') || href.startsWith('mailto:')) ? href : '#';
        return {
          tagName: 'a',
          attribs: {
            href: safeHref,
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        };
      }
    }
  });
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default sanitizeHtmlString;

