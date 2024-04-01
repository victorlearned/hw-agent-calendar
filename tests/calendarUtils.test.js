const { addDays, addMinutes, formatISO } = require('date-fns');
const { findFreeSlots, preprocessBusySlots } = require('../src/utils/calendarUtils');
const freeBusyData = require('../mocks/example-freebusy.json');

function generateBusyTestData(startDate, days) {
  let busySlots = [];
  // Append 'Z' to the startDate to ensure it's treated as UTC if it's not already included
  let currentDate = new Date(startDate.endsWith('Z') ? startDate : startDate + 'Z');

  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // Add days and minutes to the current date
      let start = addMinutes(addDays(currentDate, day), hour * 60);
      let end = addMinutes(start, 30);

      // Push the formatted slots into the array
      busySlots.push({
        start: formatISO(start, { representation: 'complete' }),
        end: formatISO(end, { representation: 'complete' })
      });
    }
  }

  return busySlots;
}


describe('preprocessBusySlots', () => {
  test('should merge overlapping busy slots and sort them', () => {
    const busySlots = [
      { start: '2024-04-01T10:00:00Z', end: '2024-04-01T11:00:00Z' },
      { start: '2024-04-01T10:30:00Z', end: '2024-04-01T12:00:00Z' }, // Overlaps with the first slot
      { start: '2024-04-01T12:30:00Z', end: '2024-04-01T13:00:00Z' }, // No overlap
      { start: '2024-04-01T09:00:00Z', end: '2024-04-01T09:30:00Z' }  // Earlier than the rest
    ];

    const mergedSlots = preprocessBusySlots(busySlots);

    // Expect the mergedSlots to have merged the first two and included the rest in order
    expect(mergedSlots.length).toBe(3);
    expect(mergedSlots[0]).toEqual({ start: '2024-04-01T09:00:00Z', end: '2024-04-01T09:30:00Z' }); // First slot, no overlap
    expect(mergedSlots[1]).toEqual({ start: '2024-04-01T10:00:00Z', end: '2024-04-01T12:00:00Z' }); // Merged slot
    expect(mergedSlots[2]).toEqual({ start: '2024-04-01T12:30:00Z', end: '2024-04-01T13:00:00Z' }); // Last slot, no overlap
  });
  // had a weird bug originally so testing basic data generating
  test('should correctly not merge busy slots over 2 days', () => {
    const busySlots = generateBusyTestData("2024-04-01T00:00:00Z", 2);

    // Process the generated busy slots
    const mergedSlots = preprocessBusySlots(busySlots);

    // Ensure that no slots overlap by checking each consecutive pair
    for (let i = 1; i < mergedSlots.length; i++) {
      const previousSlotEnd = new Date(mergedSlots[i - 1].end).getTime();
      const currentSlotStart = new Date(mergedSlots[i].start).getTime();

      // The start of the current slot should not be before the end of the previous slot
      expect(currentSlotStart).not.toBeLessThan(previousSlotEnd);
    }

    expect(mergedSlots.length).toBeLessThanOrEqual(busySlots.length);
  });
  // had a weird bug originally so testing basic data generating
  test('should freeBusyData', () => {
    const busySlots = freeBusyData.calendars['calendar-123'].busy;
    const output = [
      { "start": "2024-03-31T14:30:00Z", "end": "2024-03-31T15:30:00Z" },
      { "start": "2024-03-31T18:30:00Z", "end": "2024-03-31T19:30:00Z" },
      { "start": "2024-03-31T21:30:00Z", "end": "2024-03-31T22:30:00Z" },
      { "start": "2024-03-31T23:00:00Z", "end": "2024-04-01T01:45:00Z" },
      { "start": "2024-04-01T16:00:00Z", "end": "2024-04-01T19:15:00Z" },
      { "start": "2024-04-01T20:30:00Z", "end": "2024-04-02T04:30:00Z" },
      { "start": "2024-04-02T16:30:00Z", "end": "2024-04-02T17:30:00Z" },
      { "start": "2024-04-02T18:00:00Z", "end": "2024-04-02T19:00:00Z" },
      { "start": "2024-04-02T22:00:00Z", "end": "2024-04-03T00:30:00Z" },
      { "start": "2024-04-03T01:00:00Z", "end": "2024-04-03T03:00:00Z" },
      { "start": "2024-04-03T16:00:00Z", "end": "2024-04-04T00:15:00Z" },
      { "start": "2024-04-04T05:00:00Z", "end": "2024-04-04T06:00:00Z" },
      { "start": "2024-04-04T14:00:00Z", "end": "2024-04-04T18:15:00Z" },
      { "start": "2024-04-04T22:00:00Z", "end": "2024-04-05T02:00:00Z" },
      { "start": "2024-04-05T16:30:00Z", "end": "2024-04-05T20:30:00Z" },
      { "start": "2024-04-05T21:30:00Z", "end": "2024-04-05T22:30:00Z" },
      { "start": "2024-04-06T00:30:00Z", "end": "2024-04-06T01:30:00Z" },
      { "start": "2024-04-06T14:30:00Z", "end": "2024-04-06T18:15:00Z" },
      { "start": "2024-04-06T20:30:00Z", "end": "2024-04-07T01:15:00Z" },
      { "start": "2024-04-07T03:30:00Z", "end": "2024-04-07T04:30:00Z" },
      { "start": "2024-04-07T13:30:00Z", "end": "2024-04-07T20:15:00Z" },
      { "start": "2024-04-08T02:00:00Z", "end": "2024-04-08T03:00:00Z" },
      { "start": "2024-04-08T15:30:00Z", "end": "2024-04-08T18:00:00Z" },
      { "start": "2024-04-08T18:30:00Z", "end": "2024-04-08T19:30:00Z" },
      { "start": "2024-04-08T21:30:00Z", "end": "2024-04-09T00:45:00Z" },
      { "start": "2024-04-09T16:00:00Z", "end": "2024-04-09T18:30:00Z" },
      { "start": "2024-04-09T21:30:00Z", "end": "2024-04-10T00:15:00Z" },
      { "start": "2024-04-10T16:00:00Z", "end": "2024-04-10T17:00:00Z" },
      { "start": "2024-04-10T20:00:00Z", "end": "2024-04-10T21:00:00Z" },
      { "start": "2024-04-10T22:30:00Z", "end": "2024-04-10T23:30:00Z" },
      { "start": "2024-04-11T15:30:00Z", "end": "2024-04-11T16:30:00Z" },
      { "start": "2024-04-11T18:00:00Z", "end": "2024-04-11T19:00:00Z" },
      { "start": "2024-04-11T21:30:00Z", "end": "2024-04-11T22:30:00Z" },
      { "start": "2024-04-11T23:30:00Z", "end": "2024-04-12T00:30:00Z" }
    ];

    // Process the generated busy slots
    const mergedSlots = preprocessBusySlots(busySlots);
    expect(mergedSlots.length).toBe(34);
    expect(mergedSlots).toEqual(output);
  });
});

describe('findFreeSlots', () => {


  test('should freeBusyData', () => {
    const mergedBusySlots = [
      { "start": "2024-03-31T14:30:00Z", "end": "2024-03-31T15:30:00Z" },
      { "start": "2024-03-31T18:30:00Z", "end": "2024-03-31T19:30:00Z" },
      { "start": "2024-03-31T21:30:00Z", "end": "2024-03-31T22:30:00Z" },
      { "start": "2024-03-31T23:00:00Z", "end": "2024-04-01T01:45:00Z" },
      { "start": "2024-04-01T16:00:00Z", "end": "2024-04-01T19:15:00Z" },
      { "start": "2024-04-01T20:30:00Z", "end": "2024-04-02T04:30:00Z" },
      { "start": "2024-04-02T16:30:00Z", "end": "2024-04-02T17:30:00Z" },
      { "start": "2024-04-02T18:00:00Z", "end": "2024-04-02T19:00:00Z" },
      { "start": "2024-04-02T22:00:00Z", "end": "2024-04-03T00:30:00Z" },
      { "start": "2024-04-03T01:00:00Z", "end": "2024-04-03T03:00:00Z" },
      { "start": "2024-04-03T16:00:00Z", "end": "2024-04-04T00:15:00Z" },
      { "start": "2024-04-04T05:00:00Z", "end": "2024-04-04T06:00:00Z" },
      { "start": "2024-04-04T14:00:00Z", "end": "2024-04-04T18:15:00Z" },
      { "start": "2024-04-04T22:00:00Z", "end": "2024-04-05T02:00:00Z" },
      { "start": "2024-04-05T16:30:00Z", "end": "2024-04-05T20:30:00Z" },
      { "start": "2024-04-05T21:30:00Z", "end": "2024-04-05T22:30:00Z" },
      { "start": "2024-04-06T00:30:00Z", "end": "2024-04-06T01:30:00Z" },
      { "start": "2024-04-06T14:30:00Z", "end": "2024-04-06T18:15:00Z" },
      { "start": "2024-04-06T20:30:00Z", "end": "2024-04-07T01:15:00Z" },
      { "start": "2024-04-07T03:30:00Z", "end": "2024-04-07T04:30:00Z" },
      { "start": "2024-04-07T13:30:00Z", "end": "2024-04-07T20:15:00Z" },
      { "start": "2024-04-08T02:00:00Z", "end": "2024-04-08T03:00:00Z" },
      { "start": "2024-04-08T15:30:00Z", "end": "2024-04-08T18:00:00Z" },
      { "start": "2024-04-08T18:30:00Z", "end": "2024-04-08T19:30:00Z" },
      { "start": "2024-04-08T21:30:00Z", "end": "2024-04-09T00:45:00Z" },
      { "start": "2024-04-09T16:00:00Z", "end": "2024-04-09T18:30:00Z" },
      { "start": "2024-04-09T21:30:00Z", "end": "2024-04-10T00:15:00Z" },
      { "start": "2024-04-10T16:00:00Z", "end": "2024-04-10T17:00:00Z" },
      { "start": "2024-04-10T20:00:00Z", "end": "2024-04-10T21:00:00Z" },
      { "start": "2024-04-10T22:30:00Z", "end": "2024-04-10T23:30:00Z" },
      { "start": "2024-04-11T15:30:00Z", "end": "2024-04-11T16:30:00Z" },
      { "start": "2024-04-11T18:00:00Z", "end": "2024-04-11T19:00:00Z" },
      { "start": "2024-04-11T21:30:00Z", "end": "2024-04-11T22:30:00Z" },
      { "start": "2024-04-11T23:30:00Z", "end": "2024-04-12T00:30:00Z" }
    ];

    const queryStartTime = '2023-04-01T00:00:00Z';
    const queryEndTime = '2023-04-12T00:00:00Z';
    const meetingDuration = 15;
    const maxSlots = 5;
    const partOfDay = 'morning';
    const freeSlots = findFreeSlots({mergedBusySlots, queryStartTime, queryEndTime, meetingDuration, maxSlots});
    console.log(freeSlots);
    expect(freeSlots).toEqual([
      {
        "start": "2023-04-01T06:00:00.000Z",
        "end": "2023-04-01T06:15:00.000Z"
      },
      {
        "start": "2023-04-01T06:15:00.000Z",
        "end": "2023-04-01T06:30:00.000Z"
      },
      {
        "start": "2023-04-01T06:30:00.000Z",
        "end": "2023-04-01T06:45:00.000Z"
      },
      {
        "start": "2023-04-01T06:45:00.000Z",
        "end": "2023-04-01T07:00:00.000Z"
      },
      {
        "start": "2023-04-01T07:00:00.000Z",
        "end": "2023-04-01T07:15:00.000Z"
      }
    ]
    );
  });

  test('should find available 30-minute slots without any part of day restriction', () => {
    const busySlots = generateBusyTestData("2024-04-01T00:00:00Z", 2);
    const mergedBusySlots = preprocessBusySlots(busySlots);
    const freeSlots = findFreeSlots({mergedBusySlots, queryStartTime: "2024-04-01T00:00:00Z", queryEndTime:"2024-04-03T00:00:00Z", meetingDuration: 30, maxSlots: 10});
    expect(freeSlots.length).toBe(10);
    freeSlots.forEach(slot => {
      expect(new Date(slot.end) - new Date(slot.start)).toBe(30 * 60 * 1000);
    });
  });

  test('should find available 15-minute slots in the morning', () => {
    const busySlots = generateBusyTestData("2024-04-01T00:00:00Z", 2);
    const mergedBusySlots = preprocessBusySlots(busySlots);
    const freeSlots = findFreeSlots({mergedBusySlots, queryStartTime: "2024-04-01T00:00:00Z", queryEndTime: "2024-04-03T00:00:00Z",meetingDuration: 15, maxSlots: 10, partOfDay: 'morning'});
    expect(freeSlots.length).toBeLessThanOrEqual(10);
    freeSlots.forEach(slot => {
      const startHour = new Date(slot.start).getHours();
      expect(startHour).toBeGreaterThanOrEqual(6);
      expect(startHour).toBeLessThan(12);
      expect(new Date(slot.end) - new Date(slot.start)).toBe(15 * 60 * 1000);
    });
  });

  test('should find available 60-minute slots in the afternoon', () => {
    const busySlots = generateBusyTestData("2024-04-01T00:00:00Z", 2);
    const mergedBusySlots = preprocessBusySlots(busySlots);
    const freeSlots = findFreeSlots({mergedBusySlots, queryStartTime: "2024-04-01T00:00:00Z", queryEndTime: "2024-04-03T00:00:00Z", meetingDuration:60, maxSlots: 10, partOfDay: 'afternoon'});
    expect(freeSlots.length).toBeLessThanOrEqual(10);
    freeSlots.forEach(slot => {
      const startHour = new Date(slot.start).getHours();
      expect(startHour).toBeGreaterThanOrEqual(12);
      expect(startHour).toBeLessThan(18);
      expect(new Date(slot.end) - new Date(slot.start)).toBe(60 * 60 * 1000);
    });
  });
});
