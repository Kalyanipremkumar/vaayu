/**
 * Input sanitisation for any free-text the user supplies that is later sent to
 * Claude (notably `provenanceNotes`). This is a defence-in-depth measure
 * against prompt injection — it does NOT replace a hardened system prompt and
 * server-side validation, but it strips the most obvious injection vectors.
 */

/** Max characters we accept for a free-text field before truncating. */
export const MAX_FREE_TEXT_LENGTH = 2000;

/** Remove ASCII control characters (0x00–0x1F and 0x7F) without using a
 * control-byte regex literal in source. */
function stripControlChars(input: string): string {
  let out = '';
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0;
    out += code < 0x20 || code === 0x7f ? ' ' : ch;
  }
  return out;
}

/**
 * Sanitise a free-text field destined for the model:
 *  - strips control characters
 *  - collapses runs of whitespace
 *  - neutralises common instruction-injection markers
 *  - truncates to a sane length
 */
export function sanitizeFreeText(input: string): string {
  if (!input) return '';

  let text = stripControlChars(input).replace(/\s+/g, ' ').trim();

  // Defang phrases commonly used to hijack instructions. We don't delete the
  // user's content silently — we just wrap the imperative in quotes so the
  // model treats it as quoted text rather than a command.
  const injectionPatterns = [
    /ignore (all|any|previous|prior) (instructions|prompts)/gi,
    /disregard (the )?(above|previous|system)/gi,
    /you are now/gi,
    /system prompt/gi,
    /\bact as\b/gi,
  ];
  for (const pattern of injectionPatterns) {
    text = text.replace(pattern, (match) => `"${match}"`);
  }

  if (text.length > MAX_FREE_TEXT_LENGTH) {
    text = `${text.slice(0, MAX_FREE_TEXT_LENGTH)}…`;
  }
  return text;
}
