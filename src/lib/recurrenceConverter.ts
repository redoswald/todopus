/**
 * Converts Todoist natural language recurrence strings to RRULE format.
 *
 * Examples:
 *   "every day" → "FREQ=DAILY"
 *   "every 14 days" → "FREQ=DAILY;INTERVAL=14"
 *   "every week" → "FREQ=WEEKLY"
 *   "every Monday" → "FREQ=WEEKLY;BYDAY=MO"
 *   "every Monday and Thursday" → "FREQ=WEEKLY;BYDAY=MO,TH"
 *   "every 2 weeks" → "FREQ=WEEKLY;INTERVAL=2"
 *   "every month" → "FREQ=MONTHLY"
 *   "every 6 months" → "FREQ=MONTHLY;INTERVAL=6"
 *   "every March 1" → "FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=1"
 *   "every year" → "FREQ=YEARLY"
 */

const WEEKDAY_MAP: Record<string, string> = {
  'sunday': 'SU',
  'monday': 'MO',
  'tuesday': 'TU',
  'wednesday': 'WE',
  'thursday': 'TH',
  'friday': 'FR',
  'saturday': 'SA',
  'sun': 'SU',
  'mon': 'MO',
  'tue': 'TU',
  'wed': 'WE',
  'thu': 'TH',
  'fri': 'FR',
  'sat': 'SA',
};

const MONTH_MAP: Record<string, number> = {
  'january': 1, 'jan': 1,
  'february': 2, 'feb': 2,
  'march': 3, 'mar': 3,
  'april': 4, 'apr': 4,
  'may': 5,
  'june': 6, 'jun': 6,
  'july': 7, 'jul': 7,
  'august': 8, 'aug': 8,
  'september': 9, 'sep': 9, 'sept': 9,
  'october': 10, 'oct': 10,
  'november': 11, 'nov': 11,
  'december': 12, 'dec': 12,
};

export interface ConversionResult {
  rrule: string | null;
  warning?: string;
}

export function todoistToRRule(todoistString: string): ConversionResult {
  if (!todoistString) {
    return { rrule: null };
  }

  // Normalize: lowercase, strip time info (handled separately)
  let str = todoistString.toLowerCase().trim();

  // Remove time components like "at 6:30 am", "at 10pm"
  str = str.replace(/\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm)?/gi, '');
  str = str.trim();

  // Must start with "every"
  if (!str.startsWith('every')) {
    return {
      rrule: null,
      warning: `Unrecognized pattern (no "every"): "${todoistString}"`
    };
  }

  // Remove "every " prefix
  const pattern = str.slice(6).trim();

  // "every day"
  if (pattern === 'day') {
    return { rrule: 'FREQ=DAILY' };
  }

  // "every N days"
  const daysMatch = pattern.match(/^(\d+)\s*days?$/);
  if (daysMatch) {
    const interval = parseInt(daysMatch[1], 10);
    return { rrule: interval === 1 ? 'FREQ=DAILY' : `FREQ=DAILY;INTERVAL=${interval}` };
  }

  // "every week"
  if (pattern === 'week') {
    return { rrule: 'FREQ=WEEKLY' };
  }

  // "every N weeks"
  const weeksMatch = pattern.match(/^(\d+)\s*weeks?$/);
  if (weeksMatch) {
    const interval = parseInt(weeksMatch[1], 10);
    return { rrule: interval === 1 ? 'FREQ=WEEKLY' : `FREQ=WEEKLY;INTERVAL=${interval}` };
  }

  // "every month"
  if (pattern === 'month') {
    return { rrule: 'FREQ=MONTHLY' };
  }

  // "every N months"
  const monthsMatch = pattern.match(/^(\d+)\s*months?$/);
  if (monthsMatch) {
    const interval = parseInt(monthsMatch[1], 10);
    return { rrule: interval === 1 ? 'FREQ=MONTHLY' : `FREQ=MONTHLY;INTERVAL=${interval}` };
  }

  // "every year"
  if (pattern === 'year') {
    return { rrule: 'FREQ=YEARLY' };
  }

  // "every N years"
  const yearsMatch = pattern.match(/^(\d+)\s*years?$/);
  if (yearsMatch) {
    const interval = parseInt(yearsMatch[1], 10);
    return { rrule: interval === 1 ? 'FREQ=YEARLY' : `FREQ=YEARLY;INTERVAL=${interval}` };
  }

  // "every monday", "every monday and thursday", "every mon, wed, fri"
  const weekdayPattern = pattern.replace(/\s+and\s+/g, ', ');
  const weekdays = weekdayPattern.split(/[,\s]+/).filter(Boolean);
  const rruleDays = weekdays.map(day => WEEKDAY_MAP[day]).filter(Boolean);

  if (rruleDays.length > 0 && rruleDays.length === weekdays.length) {
    return { rrule: `FREQ=WEEKLY;BYDAY=${rruleDays.join(',')}` };
  }

  // "every march 1", "every jan 15"
  const monthDayMatch = pattern.match(/^(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?$/);
  if (monthDayMatch) {
    const month = MONTH_MAP[monthDayMatch[1]];
    const day = parseInt(monthDayMatch[2], 10);
    if (month && day >= 1 && day <= 31) {
      return { rrule: `FREQ=YEARLY;BYMONTH=${month};BYMONTHDAY=${day}` };
    }
  }

  // "every 1st", "every 15th" (of the month)
  const monthlyDayMatch = pattern.match(/^(\d{1,2})(?:st|nd|rd|th)?$/);
  if (monthlyDayMatch) {
    const day = parseInt(monthlyDayMatch[1], 10);
    if (day >= 1 && day <= 31) {
      return { rrule: `FREQ=MONTHLY;BYMONTHDAY=${day}` };
    }
  }

  // "every other day/week/month"
  if (pattern === 'other day') {
    return { rrule: 'FREQ=DAILY;INTERVAL=2' };
  }
  if (pattern === 'other week') {
    return { rrule: 'FREQ=WEEKLY;INTERVAL=2' };
  }
  if (pattern === 'other month') {
    return { rrule: 'FREQ=MONTHLY;INTERVAL=2' };
  }

  // "every weekday" / "every workday"
  if (pattern === 'weekday' || pattern === 'workday') {
    return { rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' };
  }

  // Unrecognized
  return {
    rrule: null,
    warning: `Unrecognized recurrence pattern: "${todoistString}"`
  };
}

/**
 * Batch convert and report any patterns that couldn't be converted.
 */
export function convertRecurrencePatterns(
  patterns: string[]
): { converted: Map<string, string>; warnings: string[] } {
  const converted = new Map<string, string>();
  const warnings: string[] = [];

  for (const pattern of patterns) {
    if (!pattern) continue;

    const result = todoistToRRule(pattern);
    if (result.rrule) {
      converted.set(pattern, result.rrule);
    }
    if (result.warning) {
      warnings.push(result.warning);
    }
  }

  return { converted, warnings };
}
