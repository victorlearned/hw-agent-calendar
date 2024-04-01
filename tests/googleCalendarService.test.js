const googleCalendarServiceFactory = require('../src/services/googleCalendarService');
const freeBusyData = require('../mocks/example-freebusy.json');
const calendarUtils = require('../src/utils/calendarUtils');

// // Mocking the preprocessBusySlots and findFreeSlots functions
// jest.mock('../src/utils/calendarUtils', () => ({
//   preprocessBusySlots: jest.fn(),
//   findFreeSlots: jest.fn()
// }));

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
        calendarId,
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

  describe('addAppointment', () => {
    it('should add an appointment and return a success message', async () => {
      const result = await googleCalendarService.addAppointment('123', { summary: 'Test Appointment' });
      expect(result).toHaveProperty('message', 'Appointment added successfully');
    });

    it('should return an error message for an unknown agent ID', async () => {
      const result = await googleCalendarService.addAppointment('unknown', { summary: 'Test Appointment' });
      expect(result).toHaveProperty('message', 'Agent calendar not found');
    });
  });

  describe('findCommonAvailableTimes', () => {
    it('should return common available times for provided agent IDs', async () => {
      const times = await googleCalendarService.findCommonAvailableTimes(['123', '456']);
      expect(times).toEqual(expect.arrayContaining(['2023-04-03T10:00:00Z']));
    });
  });
});
