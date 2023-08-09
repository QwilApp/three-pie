export type {
  Calendar,
  InputDate,
  CalendarEvent,
  CalendarApiGetEventsParams,
  CalendarEventAttendeeResponseStatus,
  CalendarApi
} from './types/calendar';
import { dateObjAndTimezoneToInputDate } from "./utils";

import { GoogleCalendarProvider } from "./providers/google/GoogleCalendarProvider";
import { MicrosoftCalendarProvider } from "./providers/microsoft/MicrosoftCalendarProvider";
import { CalendarApi } from "./types/calendar";

import { assertThisIsNeverReached } from "./utils";

type CalendarProvider = 'google' | 'microsoft';

export const ThreePie = {
  calendar(provider: CalendarProvider, token: string): CalendarApi {
    if (provider === "google") {
      return new GoogleCalendarProvider(token);
    } else if (provider === "microsoft") {
      return new MicrosoftCalendarProvider(token);
    }

    return assertThisIsNeverReached(provider);
  },

  toInputDate: dateObjAndTimezoneToInputDate,
  isInvalidAuthError(e: Error) { return e.name === 'InvalidAuthError'},
  isApiCallError(e: Error) { return e.name === 'ApiCallError'},
}