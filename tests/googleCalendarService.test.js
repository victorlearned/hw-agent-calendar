const googleCalendarService = require('../src/services/googleCalendarService')();
// const { add, addMinutes, formatISO } = require('date-fns');

// function generateBusyTestData(startDate, days) {
//   let busySlots = [];
//   let currentDate = new Date(startDate);

//   for (let day = 0; day < days; day++) {
//     for (let hour = 0; hour < 24; hour++) {
//       let start = add(addMinutes(currentDate, day * 1440), hour * 60); // 1440 minutes in a day
//       let end = addMinutes(start, 30); // 30-minute busy slot
//       busySlots.push({ start: formatISO(start), end: formatISO(end) });
//     }
//   }

//   return busySlots;
// }

// // Generate busy slots starting from midnight on 2024-04-01 for 2 days
// const busySlots = generateBusyTestData("2024-04-01T00:00:00Z", 2);


// console.log(busySlots);


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
