const { addDays, addMinutes, formatISO } = require('date-fns');
const { findFreeSlots, preprocessBusySlots } = require('../src/utils/calendarUtils'); 
 
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

});

describe('findFreeSlots', () => {
  // Generate test data: busy slots for 2 days, ensuring 30 available 30-minute slots
  const busySlots = generateBusyTestData("2024-04-01T00:00:00Z", 2);
  const mergedBusySlots = preprocessBusySlots(busySlots);

  test('should find available 30-minute slots without any part of day restriction', () => {
    const freeSlots = findFreeSlots(mergedBusySlots, "2024-04-01T00:00:00Z", "2024-04-03T00:00:00Z", 30, 10);
    expect(freeSlots.length).toBe(10);
    freeSlots.forEach(slot => {
      expect(new Date(slot.end) - new Date(slot.start)).toBe(30 * 60 * 1000);
    });
  });

  test('should find available 15-minute slots in the morning', () => {
    const freeSlots = findFreeSlots(mergedBusySlots, "2024-04-01T00:00:00Z", "2024-04-03T00:00:00Z", 15, 10, 'morning');
    expect(freeSlots.length).toBeLessThanOrEqual(10);
    freeSlots.forEach(slot => {
      const startHour = new Date(slot.start).getHours();
      expect(startHour).toBeGreaterThanOrEqual(6);
      expect(startHour).toBeLessThan(12);
      expect(new Date(slot.end) - new Date(slot.start)).toBe(15 * 60 * 1000);
    });
  });

  test('should find available 60-minute slots in the afternoon', () => {
    const freeSlots = findFreeSlots(mergedBusySlots, "2024-04-01T00:00:00Z", "2024-04-03T00:00:00Z", 60, 10, 'afternoon');
    expect(freeSlots.length).toBeLessThanOrEqual(10);
    freeSlots.forEach(slot => {
      const startHour = new Date(slot.start).getHours();
      expect(startHour).toBeGreaterThanOrEqual(12);
      expect(startHour).toBeLessThan(18);
      expect(new Date(slot.end) - new Date(slot.start)).toBe(60 * 60 * 1000);
    });
  });
});
