// const { google } = require('googleapis');
const { preprocessBusySlots, findFreeSlots } = require('../utils/calendarUtils');
const freeBusyData = require('../../mocks/example-freebusy.json');

const googleCalendarServiceFactory = () => {
  // Hardcoded data for demonstration purposes
  const calendars = {
    '123': { // Assuming '123' is an agentId
      calendarId: 'calendar-123',
    },
    '456': {
      calendarId: 'calendar-456',
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


  // const auth = new google.auth.GoogleAuth({
  //   keyFile: 'path-to-your-service-account-file.json',
  //   scopes: ['https://www.googleapis.com/auth/calendar'],
  // });

  // const calendarClient = google.calendar({ version: 'v3', auth });

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

  function filterByTimeRange(busyData, timeMin, timeMax) {
    const minTime = new Date(timeMin);
    const maxTime = new Date(timeMax);

    const filteredBusy = busyData.filter(({ start, end }) => {
      const startTime = new Date(start);
      const endTime = new Date(end);

      // Check if the event falls within the time range
      return startTime >= minTime && endTime <= maxTime;
    });

    return filteredBusy;
  }

  // using a mock for now unilt I get google api service account actually working
  // some reason it's not like my JWT I'm generating
  function freeBusy({ timeMin, timeMax, items }) {
    // This function simulates the freeBusy query to Google Calendar API
    // It returns hardcoded "busy" periods within the specified range for the given calendars
    // Filter the response to only include requested calendars (items)
    // const filteredResponse = {
    //   ...freeBusyData,
    //   calendars: items.reduce((acc, item) => {
    //     acc[item.id] = freeBusyData.calendars[item.id] || { busy: [] };
    //     return acc;
    //   }, {})
    // };
    const filteredResponse = {
      ...freeBusyData,
      calendars: items.reduce((acc, item) => {
        acc[item.id] = {
          busy: filterByTimeRange(freeBusyData.calendars[item.id]?.busy || [], timeMin, timeMax)
        };
        return acc;
      }, {})
    };

    return Promise.resolve(filteredResponse);
  }

  async function getCalendarByAgentId(agentId) {
    return calendars[agentId] || null;
  }

  function mergeBusySlots(calendars) {
    const mergedBusySlots = [];
    for (const calendarId in calendars) {
      const calendar = calendars[calendarId];
      if (calendar && calendar.busy) {
        mergedBusySlots.push(...calendar.busy);
      }
    }
    return mergedBusySlots;
  }

  async function findAvailableTimes({ calendarIds, queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay }) {
    const timeMin = queryStartTime;
    const timeMax = queryEndTime;
    const items = calendarIds.map(calendarId => ({ id: calendarId }));

    // Call the mocked version of freeBusy function with the provided parameters
    const response = await freeBusy({ timeMin, timeMax, items }); // TODO create better mocks

    // pull out the busy and merge if multiple calendars were requested
    const busyResponse = mergeBusySlots(response);

    // Preprocess busy slots to merge overlapping intervals
    // const mergedBusySlots = preprocessBusySlots(response.calendars[calendarId].busy);
    const mergedBusySlots = preprocessBusySlots(busyResponse);

    // Find free slots
    const freeSlots = findFreeSlots({ mergedBusySlots, queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay });

    return freeSlots;
  }

  function createCalendar() {
    // Return the mocked methods for inserting events and fetching events
    return {
      events: {
        insert: (params) => {
          const { calendarId, requestBody } = params;
          // addAppointmentToCalendar(calendarId, requestBody);
          return Promise.resolve({ data: requestBody });
        }
      },
    };
  }

  //      const calendarIds = ['calendar-123', 'calendar-456'];
  // const appointmentDetails = {
  //   summary: 'Meeting with John Doe',
  //   start: {
  //       dateTime: '2024-04-12T09:00:00Z',
  //       timeZone: 'UTC'
  //   },
  //   end: {
  //       dateTime: '2024-04-12T10:00:00Z',
  //       timeZone: 'UTC'
  //   }
  // };

  async function addAppointmentToCalendars(calendarIds, appointmentDetails) {
    try {

      // mocking google api
      const calendar = createCalendar();

      // Iterate over each calendarId and add the appointment
      const appointmentsAdded = {};
      for (const calendarId of calendarIds) {
        // Simulate adding the appointment to the calendar
        const response = await calendar.events.insert({
          calendarId,
          requestBody: appointmentDetails
        });

        // Store the response in the appointmentsAdded object
        appointmentsAdded[calendarId] = response.data;
      }

      return appointmentsAdded;
    } catch (error) {
      throw new Error(`Error adding appointment to calendars: ${error.message}`);
    }
  }

  async function findCommonAvailableTimes(agentIds) {
    return ['2023-04-03T10:00:00Z']; // Hardcoded common available time
  }

  // Exposing public API
  return {
    calendarExists,
    getCalendarByAgentId,
    findAvailableTimes,
    addAppointmentToCalendars,
    findCommonAvailableTimes,
  };
}

module.exports = googleCalendarServiceFactory;
