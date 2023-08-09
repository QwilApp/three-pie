import {
  Calendar,
  CalendarApiGetEventsParams,
  CalendarEvent,
  CalendarEventAttendeeResponseStatus
} from "../../types/calendar";
import { assertThisIsNeverReached, datetimeAndTimezoneToRFC3339String, inputDateToRFC3339String } from "../../utils";
import { MicrosoftBaseProvider } from "./base";
import { MicrosoftAttendeeResponseStatus, MicrosoftCalendarEvent, MicrosoftCalendarListEntry } from "./types";

export class MicrosoftCalendarProvider extends MicrosoftBaseProvider {
  async getCalendars() {
    // https://learn.microsoft.com/en-us/graph/api/user-list-calendars?view=graph-rest-1.0&tabs=http
    const items: MicrosoftCalendarListEntry[] = await this.paginatedRequest({
      path: '/me/calendars',
      method: 'GET',
    });

    return items
      .map(normaliseCalendarListEntry);
  }

  async getEvents({calendarId, from, to}: CalendarApiGetEventsParams) {
    // Use Calendar View instead of List Events so we don't have to manually handle recurring events
    // https://learn.microsoft.com/en-us/graph/api/calendar-list-calendarview?view=graph-rest-1.0&tabs=http
    const items: MicrosoftCalendarEvent[] = await this.paginatedRequest({
      path: `/me/calendars/${encodeURIComponent(calendarId)}/calendarView`,
      qs: {
        startDateTime: inputDateToRFC3339String(from),
        endDateTime: inputDateToRFC3339String(to),
      },
      method: 'GET',
      headers: {
        'Prefer': `outlook.timezone="${from.timezone}"`
      }
    });

    return items
      .filter(item => !item.isCancelled && !item.isDraft)
      .map(normaliseCalendarEvent);
  }
}


function translateAttendeeResponseStatus(status: MicrosoftAttendeeResponseStatus): CalendarEventAttendeeResponseStatus {
  switch (status) {
    case "none":
    case "notResponded":
      return "pending"
    case "organizer":
      return "organizer";
    case "accepted":
      return "accepted";
    case "tentativelyAccepted":
      return "tentative";
    case "declined":
      return "declined";
  }
  return assertThisIsNeverReached(status);
}


function normaliseCalendarListEntry(item: MicrosoftCalendarListEntry): Calendar {
  return {
    id: item.id,
    name: item.name,
    isPrimary: item.isDefaultCalendar,
  }
}

function normaliseCalendarEvent(item: MicrosoftCalendarEvent): CalendarEvent {
  return {
    id: item.iCalUId,
    subject: item.subject,
    body: item.bodyPreview || item.body.content,  // take text content if exists
    location: item.location.displayName,
    externalLink: item.webLink,
    isAllDay: item.isAllDay,
    createdAt: item.createdDateTime,
    start: datetimeAndTimezoneToRFC3339String(item.start.dateTime, item.start.timeZone),
    end: datetimeAndTimezoneToRFC3339String(item.end.dateTime, item.end.timeZone),
    organizer: {
      name: item.organizer.emailAddress.name,
      email: item.organizer.emailAddress.address,
    },
    attendees: (item.attendees || []).map(a => ({
      name: a.emailAddress.name,
      email: a.emailAddress.address,
      responseStatus: translateAttendeeResponseStatus(a.status),
      type: a.type,
    })),
    ...(item.seriesMasterId ? {parentId: item.seriesMasterId} : null),
  }
}