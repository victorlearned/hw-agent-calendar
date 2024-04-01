const {
  differenceInMinutes,
  isBefore,
  isAfter,
  max,
  parseISO,
  compareAsc,
  setHours,
  setMinutes,
  isWithinInterval,
  addMinutes,
  set,
} = require('date-fns');

// Define time ranges for different parts of the day
const dayParts = {
  morning: { startHour: 6, endHour: 12 },
  afternoon: { startHour: 12, endHour: 18 },
  evening: { startHour: 18, endHour: 22 },
};

// attempting to optimize by merging overlapping busy times so findFreeSlots
// doesn't have to care. Not sure this really helps much if people don't have too many
// overlapping meetings
function preprocessBusySlots(busySlots) {
  // Sort the busy slots by their start time
  busySlots.sort((a, b) => compareAsc(parseISO(a.start), parseISO(b.start)));

  let mergedSlots = [];
  let lastSlot = null;

  busySlots.forEach(slot => {
    const slotStart = parseISO(slot.start);
    const slotEnd = parseISO(slot.end);

    if (!lastSlot) {
      lastSlot = { start: slot.start, end: slot.end.replace(/\.\d{3}Z$/, 'Z') };  // Remove milliseconds
    } else {
      const lastSlotEnd = parseISO(lastSlot.end);

      // Check if the current slot overlaps with the last slot
      if (slotStart <= lastSlotEnd) {
        // If so, merge them and remove milliseconds from the end time
        lastSlot.end = max([lastSlotEnd, slotEnd]).toISOString().replace(/\.\d{3}Z$/, 'Z');
      } else {
        // If not, push the last slot to the result and start a new slot
        mergedSlots.push(lastSlot);
        // Remove milliseconds
        lastSlot = { start: slot.start, end: slot.end.replace(/\.\d{3}Z$/, 'Z') };
      }
    }
  });

  // Push the last slot after processing all slots
  if (lastSlot) {
    mergedSlots.push(lastSlot);
  }

  return mergedSlots;
}

/**
 * Function to set hours and minutes in UTC
 * 
 * @param {Date} date - The date to be adjusted.
 * @param {number} hours - The hours to be set (in UTC).
 * @param {number} minutes - The minutes to be set (in UTC).
 * @returns {Date} - The adjusted date in UTC.
 */
function setUTCHoursAndMinutes(date, hours, minutes) {
  // Adjust the date for the timezone offset to treat it as UTC
  let adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  // Set the specified hours and minutes
  adjustedDate = set(adjustedDate, { hours, minutes });
  // Convert back to UTC by subtracting the timezone offset
  adjustedDate.setMinutes(adjustedDate.getMinutes() - adjustedDate.getTimezoneOffset());
  return adjustedDate;
}

// Main function to find free slots
function findFreeSlots({mergedBusySlots, queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay = null}) {
  let freeSlots = [];
  // Parse the start time as an ISO string to a Date object
  let lastEndTime = parseISO(queryStartTime);
  let slotsFound = 0; // Counter for the found slots

  // Get the time of day filter if partOfDay is specified
  const timeOfDayFilter = partOfDay && dayParts[partOfDay];

  // Iterate over each busy slot to find potential free slots
  for (const slot of mergedBusySlots) {
    // Stop if the maximum number of desired slots has been found
    if (slotsFound >= maxSlots) break;

    // Parse the start time of the current busy slot
    const start = parseISO(slot.start);

    // Check if there's enough time between the last end time and the current slot's start
    if (differenceInMinutes(start, lastEndTime) >= meetingDuration) {
      // Initialize potential start and end times for a free slot
      let potentialStart = lastEndTime;
      let potentialEnd = addMinutes(potentialStart, meetingDuration);

      // If a time-of-day filter is specified, adjust the start and end times
      if (timeOfDayFilter) {
        // Adjust the start time to the later of the last end time or the start of the day part
        potentialStart = max([lastEndTime, setUTCHoursAndMinutes(lastEndTime, timeOfDayFilter.startHour, 0)]);
        // Recalculate the potential end time
        potentialEnd = addMinutes(potentialStart, meetingDuration);

        // Check if the potential slot fits within the day part boundaries
        if (!isWithinInterval(potentialStart, {
          start: setUTCHoursAndMinutes(potentialStart, timeOfDayFilter.startHour, 0),
          end: setUTCHoursAndMinutes(potentialStart, timeOfDayFilter.endHour, 0)
        }) || !isBefore(potentialEnd, setUTCHoursAndMinutes(potentialStart, timeOfDayFilter.endHour, 0))) {
          // If not, skip to the next iteration
          continue;
        }
      }

      // Ensure the potential free slot does not extend beyond the query's end time
      if (isAfter(potentialEnd, parseISO(queryEndTime))) {
        break;
      }

      // If the slot is long enough, add it to the list of free slots
      if (differenceInMinutes(potentialEnd, potentialStart) >= meetingDuration) {
        freeSlots.push({ start: potentialStart.toISOString(), end: potentialEnd.toISOString() });
        slotsFound++; // Increment the count of found slots
      }
    }

    // Update the last end time to the end of the current busy slot
    lastEndTime = isAfter(parseISO(slot.end), lastEndTime) ? parseISO(slot.end) : lastEndTime;
  }

  // Return the list of identified free slots
  return freeSlots;
}

module.exports = { findFreeSlots, preprocessBusySlots };