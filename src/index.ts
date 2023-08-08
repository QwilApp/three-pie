export type {
  Calendar,
  InputDate,
  CalendarEvent,
  CalendarApiGetEventsParams,
  CalendarEventAttendeeResponseStatus,
  CalendarApi
} from './types/calendar';
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
}