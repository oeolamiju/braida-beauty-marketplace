import db from "../db";

export interface TimePreference {
  dayPattern?: 'weekday' | 'weekend' | 'any';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  specificDays?: number[];
}

interface AvailabilityRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface AvailabilityMatch {
  matched: boolean;
  matchedPatterns: string[];
}

const TIME_RANGES: Record<string, { startTime: string; endTime: string }> = {
  morning: { startTime: '06:00', endTime: '12:00' },
  afternoon: { startTime: '12:00', endTime: '18:00' },
  evening: { startTime: '18:00', endTime: '22:00' },
};

const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND = [0, 6];

export async function checkAvailabilityPattern(
  freelancerId: string,
  preference: TimePreference
): Promise<AvailabilityMatch> {
  const rules = await db.queryAll<AvailabilityRule>`
    SELECT day_of_week, start_time, end_time
    FROM availability_rules
    WHERE freelancer_id = ${freelancerId}
      AND is_active = true
  `;

  if (rules.length === 0) {
    return { matched: false, matchedPatterns: [] };
  }

  const matchedPatterns: string[] = [];
  let matched = false;

  const targetDays = getTargetDays(preference);
  const { startTime, endTime } = getTargetTimeRange(preference);

  for (const rule of rules) {
    if (!targetDays.includes(rule.day_of_week)) {
      continue;
    }

    if (hasTimeOverlap(rule.start_time, rule.end_time, startTime, endTime)) {
      matched = true;
      matchedPatterns.push(formatPattern(rule.day_of_week, rule.start_time, rule.end_time, preference));
    }
  }

  return { matched, matchedPatterns: [...new Set(matchedPatterns)] };
}

function getTargetDays(preference: TimePreference): number[] {
  if (preference.specificDays && preference.specificDays.length > 0) {
    return preference.specificDays;
  }

  if (preference.dayPattern === 'weekday') {
    return WEEKDAYS;
  }

  if (preference.dayPattern === 'weekend') {
    return WEEKEND;
  }

  return [0, 1, 2, 3, 4, 5, 6];
}

function getTargetTimeRange(preference: TimePreference): { startTime: string; endTime: string } {
  if (preference.timeOfDay && preference.timeOfDay !== 'any') {
    return TIME_RANGES[preference.timeOfDay];
  }

  return { startTime: '00:00', endTime: '23:59' };
}

function hasTimeOverlap(
  ruleStart: string,
  ruleEnd: string,
  targetStart: string,
  targetEnd: string
): boolean {
  const ruleStartMins = timeToMinutes(ruleStart);
  const ruleEndMins = timeToMinutes(ruleEnd);
  const targetStartMins = timeToMinutes(targetStart);
  const targetEndMins = timeToMinutes(targetEnd);

  return ruleStartMins < targetEndMins && ruleEndMins > targetStartMins;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatPattern(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  preference: TimePreference
): string {
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
  
  if (preference.dayPattern === 'weekday' && WEEKDAYS.includes(dayOfWeek)) {
    if (preference.timeOfDay && preference.timeOfDay !== 'any') {
      return `Weekday ${preference.timeOfDay}s`;
    }
    return 'Weekdays';
  }

  if (preference.dayPattern === 'weekend' && WEEKEND.includes(dayOfWeek)) {
    if (preference.timeOfDay && preference.timeOfDay !== 'any') {
      return `Weekend ${preference.timeOfDay}s`;
    }
    return 'Weekends';
  }

  if (preference.timeOfDay && preference.timeOfDay !== 'any') {
    return `${dayName} ${preference.timeOfDay}`;
  }

  return `${dayName} ${startTime}-${endTime}`;
}
