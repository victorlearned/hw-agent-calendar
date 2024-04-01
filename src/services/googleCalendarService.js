const { google } = require('googleapis');

const googleCalendarServiceFactory = () => {
  // Hardcoded data for demonstration purposes
  const calendars = {
    '123': { // Assuming '123' is an agentId
      calendarId: 'calendar-123',
      events: [
        { id: 'event-1', start: '2023-04-01T10:00:00Z', end: '2023-04-01T11:00:00Z', summary: 'Event 1' },
        { id: 'event-2', start: '2023-04-02T15:00:00Z', end: '2023-04-02T16:00:00Z', summary: 'Event 2' }
      ]
    },
    '456': {
      calendarId: 'calendar-456',
      events: [
        { id: 'event-1', start: '2023-04-01T10:00:00Z', end: '2023-04-01T11:00:00Z', summary: 'Event 1' },
        { id: 'event-2', start: '2023-04-02T18:00:00Z', end: '2023-04-02T19:00:00Z', summary: 'Event 2' }
      ]
    }
  };
    // Mock calendar data
    const mockCalendars = new Map([
      ['calendar-123', { summary: 'Calendar 1' }],
      ['calendar-456', { summary: 'Calendar 2' }],
    ]);
  
    async function calendarExists(calendarId) {
      return mockCalendars.has(calendarId);
    }
  

  const auth = new google.auth.GoogleAuth({
    keyFile: 'path-to-your-service-account-file.json',
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const calendarClient = google.calendar({ version: 'v3', auth });

  // using a mock for now unilt I get google api service account actually working
  // some reason it's not like my JWT I'm generating
  function freeBusy({ timeMin, timeMax, items }) {
    // This function simulates the freeBusy query to Google Calendar API
    // It returns hardcoded "busy" periods within the specified range for the given calendars

    // Example response structure based on the real Google Calendar API response for freeBusy
    const exampleResponse = {
      kind: "calendar#freeBusy",
      timeMin: timeMin,
      timeMax: timeMax,
      calendars: {
        'calendar-123': {
          busy: [
            { start: '2023-04-01T10:00:00Z', end: '2023-04-01T11:00:00Z' },
            { start: '2023-04-02T15:00:00Z', end: '2023-04-02T16:00:00Z' }
          ]
        },
      }
    };

    // Filter the response to only include requested calendars (items)
    const filteredResponse = {
      ...exampleResponse,
      calendars: items.reduce((acc, item) => {
        acc[item.id] = exampleResponse.calendars[item.id] || { busy: [] };
        return acc;
      }, {})
    };

    return Promise.resolve(filteredResponse);
  }

  // attempt to get real calls with api
  // async function calendarExists(calendarId) {
  //   try {
  //     const calendar = await calendarClient.calendars.get({ calendarId });
  //     return !!calendar;
  //   } catch (error) {
  //     if (error.code === 404) {
  //       return false;
  //     }
  //     throw error;
  //   }
  // }

  async function getCalendarByAgentId(agentId) {
    return calendars[agentId] || null;
  }

  async function findAvailableTimes(agentId) {
    if (calendars[agentId]) {
      return ['2023-04-01T12:00:00Z', '2023-04-02T17:00:00Z']; // Hardcoded available times
    }
    return [];
  }

  async function addAppointment(agentId, appointmentDetails) {
    if (calendars[agentId]) {
      calendars[agentId].events.push(appointmentDetails);
      return { message: 'Appointment added successfully', appointmentDetails };
    }
    return { message: 'Agent calendar not found' };
  }

  async function findCommonAvailableTimes(agentIds) {
    return ['2023-04-03T10:00:00Z']; // Hardcoded common available time
  }

  // Exposing public API
  return {
    calendarExists,
    getCalendarByAgentId,
    findAvailableTimes,
    addAppointment,
    findCommonAvailableTimes,
  };
}

module.exports = googleCalendarServiceFactory;
