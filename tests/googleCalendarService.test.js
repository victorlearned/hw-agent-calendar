const googleCalendarServiceFactory = require('../src/services/googleCalendarService');
const freeBusyData = require('../mocks/example-freebusy.json');
const calendarUtils = require('../src/utils/calendarUtils');

jest.spyOn(calendarUtils, 'preprocessBusySlots');
jest.spyOn(calendarUtils, 'findFreeSlots');

describe('Google Calendar Service', () => {
  let googleCalendarService;

  beforeEach(() => {
    googleCalendarService = googleCalendarServiceFactory();
  });

  describe('getCalendarByAgentId', () => {
    it('should return the calendar for a given agent ID', async () => {
      const calendar = await googleCalendarService.getCalendarByAgentId('123');
      expect(calendar).toHaveProperty('calendarId', 'calendar-123');
    });

    it('should return null for an unknown agent ID', async () => {
      const calendar = await googleCalendarService.getCalendarByAgentId('unknown');
      expect(calendar).toBeNull();
    });
  });

  describe('findAvailableTimes', () => {
    it('should call preprocessBusySlots and findFreeSlots with the correct parameters', async () => {
      const calendarId = 'calendar-123';
      const queryStartTime = '2023-04-01T00:00:00Z';
      const queryEndTime = '2023-04-12T00:00:00Z';
      const meetingDuration = 15;
      const maxSlots = 5;
      const partOfDay = 'morning';
  
      const mockResponse = calendarUtils.preprocessBusySlots(freeBusyData.calendars[calendarId].busy);
  
      // Mocked result from findFreeSlots function
      const mockFreeSlots = [
        { start: '2023-04-01T00:00:00Z', end: '2023-04-01T10:00:00Z' },
        { start: '2023-04-01T11:00:00Z', end: '2023-04-01T15:00:00Z' }
      ];
  
      // Mock the implementation of findFreeSlots
      // findFreeSlots.mockReturnValue(mockFreeSlots);
  
      // Call the function
      const result = await googleCalendarService.findAvailableTimes({
        calendarIds: [calendarId],
        queryStartTime,
        queryEndTime,
        meetingDuration,
        maxSlots,
        partOfDay
      });
  
      //console.log('findAval mockResponse ', mockResponse);
      expect(calendarUtils.findFreeSlots).toHaveBeenCalled();
      expect(calendarUtils.preprocessBusySlots).toHaveBeenCalled();
      // Check if preprocessBusySlots and findFreeSlots were called with the correct parameters
      expect(preprocessBusySlots).toHaveBeenCalledWith(freeBusyData.calendars[calendarId].busy);
      expect(findFreeSlots).toHaveBeenCalledWith(
        mockResponse,
        queryStartTime,
        queryEndTime,
        meetingDuration,
        maxSlots,
        partOfDay
      );
  
      // Check if the result matches the expected free slots
      expect(result).toEqual(mockFreeSlots);
    });
  });

  describe('addAppointmentToCalendars', () => {
    it('should add appointment to calendars and return appointmentsAdded object', async () => {
        // Mock calendarIds and appointmentDetails
        const calendarIds = ['calendar-123', 'calendar-456'];
        const appointmentDetails = {
            summary: 'Meeting with John Doe',
            start: {
                dateTime: '2024-04-12T09:00:00Z',
                timeZone: 'UTC'
            },
            end: {
                dateTime: '2024-04-12T10:00:00Z',
                timeZone: 'UTC'
            }
        };

        // Call the function being tested
        const result = await googleCalendarService.addAppointmentToCalendars(calendarIds, appointmentDetails);

        // Expectations
        expect(result).toEqual({
            'calendar-123': appointmentDetails,
            'calendar-456': appointmentDetails,
        });
    });
});

  describe('findCommonAvailableTimes', () => {
    it('should return common available times for provided agent IDs', async () => {
      const times = await googleCalendarService.findCommonAvailableTimes(['123', '456']);
      expect(times).toEqual(expect.arrayContaining(['2023-04-03T10:00:00Z']));
    });
  });
});
