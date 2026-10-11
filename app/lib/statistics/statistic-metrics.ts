/**
 * Formats `part / whole` as a whole-number percentage.
 */
export function formatPercent(part: number, whole: number): string {
    return whole === 0 ? "—" : `${Math.round((part / whole) * 100)}%`
}
