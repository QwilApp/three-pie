import {
  Calendar,
  CalendarApiGetEventsParams,
  CalendarEvent,
  CalendarEventAttendeeResponseStatus
} from "../../types/calendar";
import { assertThisIsNeverReached, inputDateToRFC3339String } from "../../utils";
import { GoogleBaseProvider } from "./base";
import {
  GoogleAttendeeResponseStatus,
  GoogleCalendarEvent,
  GoogleCalendarListEntry,
  GoogleDateForAllDayEvent,
  GoogleDateForPartialDayEvent,
  GoogleEventDate
} from "./types";

export class GoogleCalendarProvider extends GoogleBaseProvider {
  apiBaseUrl = "https://www.googleapis.com/calendar/v3";

  async getCalendars() {
    const items: GoogleCalendarListEntry[] = await this.paginatedRequest({
      path: '/users/me/calendarList',
      method: 'GET',
    });

    return items
      .filter(item => !item.hidden)
      .map(normaliseCalendarListEntry);
  }

  async getEvents({calendarId, from, to}: CalendarApiGetEventsParams) {
    const params = {
      orderBy: "startTime",
      timeMin: inputDateToRFC3339String(from),
      timeMax: inputDateToRFC3339String(to),
      // expand events to individual instances, otherwise we need to handle recurring events
      // ourselves and that might have been created before our query window.
      singleEvents: "true",
    };

    const items: GoogleCalendarEvent[] = await this.paginatedRequest({
      path: `/calendars/${encodeURIComponent(calendarId)}/events`,
      method: 'GET',
      qs: params,
    });

    return items
      .filter(item => item.status !== 'cancelled')
      .map(normaliseCalendarEvent);
  }
}

function isAllDayEvent(d: GoogleEventDate): d is GoogleDateForAllDayEvent {
  return (d as GoogleDateForAllDayEvent).date !== undefined;
}



function translateAttendeeResponseStatus(status: GoogleAttendeeResponseStatus, isOrganizer: boolean): CalendarEventAttendeeResponseStatus {
  if (isOrganizer) {
    return 'organizer';
  }

  switch (status) {
    case "needsAction":
      return "pending"
    case "accepted":
      return "accepted";
    case "tentative":
      return "tentative";
    case "declined":
      return "declined";
  }
  return assertThisIsNeverReached(status);
}

function normaliseCalendarListEntry(item: GoogleCalendarListEntry): Calendar {
  return {
    id: item.id,
    name: item.summaryOverride || item.summary,
    isPrimary: item.primary,
    // timezone: item.timeZone,
  }
}

function normaliseCalendarEvent(item: GoogleCalendarEvent): CalendarEvent {
  let start: string;
  let end: string;
  if (isAllDayEvent(item.start)) {
    start = item.start.date;
    end = (item.end as GoogleDateForAllDayEvent).date;
  } else {
    start = item.start.dateTime;
    end = (item.end as GoogleDateForPartialDayEvent).dateTime;
  }
  const allDay = isAllDayEvent(item.start);

  return {
    id: item.id,
    subject: item.summary,
    body: item.description,
    location: item.location || "",
    externalLink: item.htmlLink,
    isAllDay: allDay,
    createdAt: item.created,
    start: start,
    end: end,
    organizer: {
      name: item.organizer.displayName,
      email: item.organizer.email,
    },
    attendees: (item.attendees || []).map(a => ({
      name: a.displayName,
      email: a.email,
      responseStatus: translateAttendeeResponseStatus(a.responseStatus, a.organizer),
      type: a.resource ? 'resource' : a.optional ? 'optional' : 'required',
    })),
    ...(item.recurringEventId ? {parentId: item.recurringEventId} : null),
  }
}
