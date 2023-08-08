export interface GoogleCalendarListEntry {
  // this is just a subset. Full definition:
  // https://developers.google.com/calendar/api/v3/reference/calendarList#resource-representations
  kind: 'calendar#calendarListEntry';
  id: string;
  summary: string;
  summaryOverride?: string;
  timeZone: string;
  primary: boolean;
  hidden?: boolean;
}

export interface GoogleDateForAllDayEvent {
  date: string, // Format = "yyyy-mm-dd". Specified only for all-day events
}

export interface GoogleDateForPartialDayEvent {
  dateTime: string, // A combined date-time value (formatted according to RFC3339)
}

export type GoogleEventDate = GoogleDateForAllDayEvent | GoogleDateForPartialDayEvent;

export type GoogleAttendeeResponseStatus = 'needsAction' | 'declined' | 'tentative' | 'accepted';

export interface GoogleEventAttendee {
  displayName?: string;
  email?: string;
  responseStatus: GoogleAttendeeResponseStatus;
  organizer: boolean;
  resource: boolean;
  optional: boolean;
}

export interface GoogleCalendarEvent {
  // this is just a subset. Full definition:
  // https://developers.google.com/calendar/api/v3/reference/events#resource-representations
  kind: 'calendar#event';
  id: string; // this is for event, but could be many with the same if recurring event
  iCalUID: string; // this will be unique even for recurring event
  summary: string;
  description: string;
  location?: string;
  htmlLink: string;
  start: GoogleEventDate;
  end: GoogleEventDate;
  status: 'confirmed' | 'tentative' | 'cancelled';
  created: string;
  organizer: {
    displayName?: string;
    email?: string;
  };
  attendees: GoogleEventAttendee[];
  recurringEventId?: string
}