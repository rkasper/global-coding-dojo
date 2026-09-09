const WALL_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;

function validateWallTime(wallTime: string): void {
  const match = WALL_TIME_PATTERN.exec(wallTime);
  if (!match) {
    throw new Error(
      `Invalid time "${wallTime}": expected the format "YYYY-MM-DDTHH:mm:ss".`,
    );
  }
  const [, , month, day, hour, minute, second] = match;
  if (Number(hour) > 23) {
    throw new Error(
      `Invalid time "${wallTime}": hour ${hour} is not a valid 24-hour value (00-23).`,
    );
  }
  if (Number(minute) > 59) {
    throw new Error(
      `Invalid time "${wallTime}": minute ${minute} is not valid (00-59).`,
    );
  }
  if (Number(second) > 59) {
    throw new Error(
      `Invalid time "${wallTime}": second ${second} is not valid (00-59).`,
    );
  }
  if (Number(month) < 1 || Number(month) > 12) {
    throw new Error(
      `Invalid time "${wallTime}": month ${month} is not valid (01-12).`,
    );
  }
  if (Number(day) < 1 || Number(day) > 31) {
    throw new Error(
      `Invalid time "${wallTime}": day ${day} is not valid (01-31).`,
    );
  }
}

function partsInZone(instant: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

// DST means some local times don't exist (spring-forward gap) or happen
// twice (fall-back repeat). This resolves both by anchoring on the offset
// in effect for the wall time read literally as UTC, which in practice
// picks the pre-transition (still-DST) offset for the ambiguous hour.
function wallTimeToUtcMillis(wallTime: string, timeZone: string): number {
  const guessUtcMillis = new Date(`${wallTime}Z`).getTime();
  const displayedInZone = new Date(
    `${partsInZone(new Date(guessUtcMillis), timeZone)}Z`,
  ).getTime();
  const offsetMillis = guessUtcMillis - displayedInZone;
  return guessUtcMillis + offsetMillis;
}

export function convert(time_of_day: string, initial_tz: string, final_tz: string) {
  validateWallTime(time_of_day);
  const utcMillis = wallTimeToUtcMillis(time_of_day, initial_tz);
  return partsInZone(new Date(utcMillis), final_tz);
}

