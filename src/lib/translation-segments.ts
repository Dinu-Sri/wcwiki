/**
 * Split HTML body content into translatable segments.
 * Splits on block-level elements: p, h1-h6, blockquote, li, figcaption.
 * Each segment is keyed as body_0, body_1, body_2, etc.
 */
export function splitBodyIntoSegments(html: string): { key: string; html: string }[] {
  if (!html || html.trim().length === 0) return [];

  // Split on block-level element boundaries
  // This regex matches opening tags of block elements
  const blockPattern = /<(p|h[1-6]|blockquote|li|figcaption|div|tr)[\s>]/gi;

  const segments: { key: string; html: string }[] = [];
  const matches: { index: number }[] = [];

  let match;
  while ((match = blockPattern.exec(html)) !== null) {
    matches.push({ index: match.index });
  }

  if (matches.length === 0) {
    // No block elements found — treat the whole body as one segment
    segments.push({ key: "body_0", html: html.trim() });
    return segments;
  }

  // If there's content before the first block element, include it
  if (matches[0].index > 0) {
    const pre = html.slice(0, matches[0].index).trim();
    if (pre.length > 0) {
      segments.push({ key: `body_${segments.length}`, html: pre });
    }
  }

  // Split between block elements
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : html.length;
    const segmentHtml = html.slice(start, end).trim();
    if (segmentHtml.length > 0) {
      segments.push({ key: `body_${segments.length}`, html: segmentHtml });
    }
  }

  return segments;
}

/**
 * Join translated segments back into a full HTML body.
 * Takes a map of segment keys to translated values.
 */
export function joinSegments(segments: Record<string, string>): string {
  // Sort by numeric index
  const sorted = Object.entries(segments)
    .filter(([key]) => key.startsWith("body_"))
    .sort((a, b) => {
      const numA = parseInt(a[0].replace("body_", ""), 10);
      const numB = parseInt(b[0].replace("body_", ""), 10);
      return numA - numB;
    });

  return sorted.map(([, value]) => value).join("\n");
}
