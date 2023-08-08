import { DateTime } from "luxon";
import { InputDate } from "./types/calendar";


const regexRFC3339Date = /((\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[+-]\d{2}:\d{2})?/;

export function parseRFC3339Date(dateString: string) {
  const match = dateString.match(regexRFC3339Date);
  if (!match) {
    return null;
  } else {
    const [
      , // (extra comma intentional. full match at index 0 ignored)
      dateTime,
      date,
      time,
      offset
    ] = match;
    return {date, time, dateTime, offset};
  }
}

export function inputDateToRFC3339String(date: InputDate) {
  return DateTime.fromObject({
    year: date.year,
    month: date.month,
    day: date.day,
    hour: date.hour || 0,
    minute: date.minute || 0,
    second: date.seconds || 0,
  }, {zone: date.timezone}).toString();
}

export function datetimeAndTimezoneToRFC3339String(datetime: string, timezone: string) {
  return DateTime.fromISO(datetime)
    .setZone(timezone, {keepLocalTime: true}) // replace tz without shifting time
    .toString();
}

export function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function assertThisIsNeverReached(x: never): never {
  throw new Error(`This should never happen. Did you forget a case when handing '${x}'?`)
}