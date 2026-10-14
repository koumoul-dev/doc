// A bare `YYYY-MM-DD` is a calendar date. `new Date()` would read it as UTC midnight
// and show the previous day west of UTC, so it is reformatted without going through Date.
export function formatDate (date: string | undefined): string {
  if (!date) return ''
  const calendar = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (calendar) return `${calendar[3]}/${calendar[2]}/${calendar[1]}`
  const parsed = new Date(date)
  return isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('fr-FR')
}
