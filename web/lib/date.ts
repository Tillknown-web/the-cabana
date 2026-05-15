const LA_DATE_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const LA_YEAR_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
})

/** Returns today's date formatted in LA time, e.g. "May 15, 2026" */
export function getTodayLA(): string {
  return LA_DATE_FMT.format(new Date())
}

/** Returns today's year in LA time, e.g. "2026" */
export function getTodayYearLA(): string {
  return LA_YEAR_FMT.format(new Date())
}
