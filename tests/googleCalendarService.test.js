const googleCalendarService = require('../src/services/googleCalendarService')();


describe('Google Calendar Service', () => {
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
    it('should return available times for a known agent ID', async () => {
      const times = await googleCalendarService.findAvailableTimes('123');
      expect(times).toEqual(expect.arrayContaining(['2023-04-01T12:00:00Z']));
    });

    it('should return an empty array for an unknown agent ID', async () => {
      const times = await googleCalendarService.findAvailableTimes('unknown');
      expect(times).toEqual([]);
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