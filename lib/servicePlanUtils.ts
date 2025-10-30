// Shared types and helper utilities for Service Plan pages

export interface Member {
  id: string;
  name: string;
  email: string;
  number: string | null;
  parentNum: string | null;
  role: string | null;
  team: string | null;
}

export interface ServicePlanProgram {
  TimePeriod: string; // e.g., "7:00am ~ 7:05am"
  Program: string;
  Anchors: string[];
  BackupAnchors: string[];
}

export interface ServicePlanForm {
  date: string;
  programs: ServicePlanProgram[];
}

// ---- Time helpers ----

const TIME_PERIOD_SEPARATOR = " ~ ";

/**
 * Split a TimePeriod string into [start, end]. If end not present, provide a sensible fallback.
 */
export function splitTimePeriod(period: string): [string, string] {
  const [startRaw, endRaw] = String(period || "").split(TIME_PERIOD_SEPARATOR);
  const start = (startRaw || "7:00am").trim();
  const end = (endRaw || "7:05am").trim();
  return [start, end];
}

/** Join a start and end time into a TimePeriod string */
export function joinTimePeriod(start: string, end: string): string {
  return `${start}${TIME_PERIOD_SEPARATOR}${end}`;
}

/** Convert a 12-hour time string like "7:05am" to minutes since midnight */
export function timeStringToMinutes(t: string): number {
  const match = String(t || "")
    .trim()
    .match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return 0; // fallback
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3].toLowerCase();

  if (hour === 12) hour = 0; // 12am => 0, 12pm => add 12 later
  let h24 = hour;
  if (meridiem === "pm") h24 += 12;
  return h24 * 60 + minute;
}

/** Convert minutes since midnight to a 12-hour time like "7:05am" */
export function minutesToTimeString(total: number): string {
  const minutes = ((total % (24 * 60)) + 24 * 60) % (24 * 60); // normalize
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const meridiem = h24 >= 12 ? "pm" : "am";
  const h12Raw = h24 % 12;
  const h12 = h12Raw === 0 ? 12 : h12Raw;
  return `${h12}:${String(m).padStart(2, "0")}${meridiem}`;
}

/** Add delta minutes to a 12-hour time string and return a new time string */
export function addMinutes(time: string, delta: number): string {
  const base = timeStringToMinutes(time);
  return minutesToTimeString(base + delta);
}

/** For 5-minute slot stepping */
export function getNextEndTime(currentTime: string): string {
  return addMinutes(currentTime, 5);
}

// ---- Collections/helpers ----

/** Toggle presence of a name in a list, case-insensitive, returning a new array */
export function toggleCaseInsensitive(list: string[], name: string): string[] {
  const target = (name || "").trim();
  if (!target) return list;
  const exists = list.some((n) => n.toLowerCase() === target.toLowerCase());
  return exists
    ? list.filter((n) => n.toLowerCase() !== target.toLowerCase())
    : [...list, target];
}

/** Count unique anchors across programs */
export function uniqueAnchorsCount(programs: ServicePlanProgram[]): number {
  const set = new Set<string>();
  for (const p of programs) {
    for (const a of p.Anchors) set.add(a.toLowerCase());
  }
  return set.size;
}
