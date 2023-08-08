export interface Calendar {
  id: string;
  name: string;
  isPrimary: boolean;
  // Microsoft Calendar doesn't have default timezone, so we can't use this.
  // timezone: string;
}

export type CalendarEventAttendeeResponseStatus = 'pending' | 'declined' | 'tentative' | 'accepted' | 'organizer';
export type CalendarEventAttendeeType = 'resource' | 'required' | 'optional';

export interface CalendarEventAttendee {
  name?: string;
  email?: string;
  responseStatus: CalendarEventAttendeeResponseStatus;
  type: CalendarEventAttendeeType;
}

export interface CalendarEvent {
  id: string;
  subject: string;
  body: string;
  bodyPreview?: string; // text-only version of description
  location: string;
  externalLink: string;
  isAllDay: boolean;
  createdAt: string;  // RFC3339 Date String e.g. "2022-10-01T23:10:23.000+01:00"
  start: string; // "yyyy-mm-dd" if all day event, else RFC3339 Date String e.g. "2022-10-01T23:10:23.000+01:00"
  end: string; // "yyyy-mm-dd" if all day event, else RFC3339 Date String e.g. "2022-10-01T23:10:23.000+01:00"
  organizer: {
    name?: string;
    email?: string;
  };
  attendees: CalendarEventAttendee[];
  /**
   * If this is a recurring event, parentId will reference the parent event.
   */
  parentId?: string
}

export interface InputDate {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  seconds?: number;
  timezone: string;
}

export interface CalendarApiGetEventsParams {
  calendarId: string;
  from: InputDate;
  to: InputDate;
}

export interface CalendarApi {
  getCalendars: () => Promise<Calendar[]>;
  getEvents: (params: CalendarApiGetEventsParams) => Promise<CalendarEvent[]>;
}