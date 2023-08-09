export interface MicrosoftCalendarListEntry {
  // this is just a subset. Full definition:
  // https://learn.microsoft.com/en-us/graph/api/resources/calendar?view=graph-rest-1.0#properties
  id: string;
  name: string;
  isDefaultCalendar: boolean;
}

export interface MicrosoftEmailAddressParts {
  address: string;
  name: string;
}

export type MicrosoftAttendeeResponseStatus =
  'none'
  | 'organizer'
  | 'tentativelyAccepted'
  | 'accepted'
  | 'declined'
  | 'notResponded';

export type MicrosoftAttendeeType = 'resource' | 'required' | 'optional';

export interface MicrosoftEventAttendee {
  emailAddress: MicrosoftEmailAddressParts;
  status: MicrosoftAttendeeResponseStatus;
  type: MicrosoftAttendeeType;
}

export interface MicrosoftCalendarEvent {
  // this is just a subset. Full definition:
  // https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0#properties
  id: string; // this is for event, but could be many with the same if recurring event
  iCalUId: string; // this will be unique even for recurring event
  subject: string;
  body: {
    content: string;
    contentType: 'text' | 'html';
  };
  bodyPreview: string;
  location: {
    displayName: string;
    // ignore other attributes
  };
  webLink: string;
  isAllDay: boolean;
  isCancelled: boolean;
  isDraft: boolean;
  createdDateTime: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  organizer: {
    emailAddress: MicrosoftEmailAddressParts;
  };
  attendees?: MicrosoftEventAttendee[];
  seriesMasterId?: string;
}