/**
 * Escape user-controlled values before embedding in PostgREST `.or()` filter strings.
 * PostgREST treats `,` `.` and whitespace as syntax; wrap values in double quotes.
 * Prefer `.eq()` / `.ilike(column, value)` when a single-column filter is enough.
 */
export function escapePostgrestValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Build a safe `column.ilike."%term%"` clause for `.or()` filters. */
export function postgrestIlikeClause(column: string, term: string): string {
  const trimmed = term.trim();
  if (!trimmed) {
    throw new Error("Empty PostgREST ilike term");
  }
  return `${column}.ilike.${escapePostgrestValue(`%${trimmed}%`)}`;
}
