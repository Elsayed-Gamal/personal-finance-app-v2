export const FINANCE_TIME_ZONE = 'Africa/Cairo';

export function todayISO(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: FINANCE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function monthRange(input, now = new Date()) {
  const month = typeof input === 'string' && /^(19|20|21)\d{2}-(0[1-9]|1[0-2])$/.test(input)
    ? input : todayISO(now).slice(0, 7);
  const [year, number] = month.split('-').map(Number);
  return {
    month, start: `${month}-01`,
    end: new Date(Date.UTC(year, number, 1)).toISOString().slice(0, 10),
    label: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(`${month}-01T00:00:00Z`)),
  };
}
