/**
 * Splits the stored tags text into individual tags.
 *
 * - "#login, #ui"      -> ["#login", "#ui"]   (comma separated)
 * - "#delivery #feature" -> ["#delivery", "#feature"] (hash tags separated by spaces)
 * - "User Management"  -> ["User Management"] (a single tag with a space)
 */
export function parseTags(tags: string | null | undefined): string[] {
  if (!tags || tags.trim() === '') {
    return [];
  }
  const parts = tags.includes(',') ? tags.split(',') : tags.includes('#') ? tags.split(/\s+/) : [tags];
  return parts.map((tag) => tag.trim()).filter((tag) => tag !== '');
}

/** Joins tags back into the text stored by the back end ("#a, #b"). */
export function joinTags(tags: readonly string[]): string {
  return tags.map((tag) => tag.trim()).filter((tag) => tag !== '').join(', ');
}
