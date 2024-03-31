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

// assumes all intervals in mergedBusySlots are distinct
function findFreeSlots(mergedBusySlots, queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay = null) {
    let freeSlots = [];
    let lastEndTime = new Date(queryStartTime);
    let slotsFound = 0;

    // Check if a part of the day is specified and valid. If not, no time-of-day filter will be applied.
    const timeOfDayFilter = partOfDay && dayParts[partOfDay];

    // Iterate over each busy slot to identify potential free slots
    for (const slot of mergedBusySlots) {
        // Stop if the desired number of free slots has been found
        if (slotsFound >= maxSlots) break;

        // Start time of the current busy slot
        const start = parseISO(slot.start);

        // If there is enough time between the last end time and the start of the current busy slot
        if (differenceInMinutes(start, lastEndTime) >= meetingDuration) {
            // Set potential start and end times for the free slot
            let potentialStart = lastEndTime;
            let potentialEnd = addMinutes(potentialStart, meetingDuration);

            // If a time-of-day filter is specified, adjust the potential start and end times accordingly
            if (timeOfDayFilter) {
                // Adjust the potential start time to the later of the last end time or the start of the part of day
                potentialStart = max([lastEndTime, setMinutes(setHours(lastEndTime, timeOfDayFilter.startHour), 0)]);
                // Calculate the potential end time based on the adjusted start time
                potentialEnd = addMinutes(potentialStart, meetingDuration);

                // Check if the potential slot fits within the specified part of day
                if (!isWithinInterval(potentialStart, {
                    start: setMinutes(setHours(potentialStart, timeOfDayFilter.startHour), 0),
                    end: setMinutes(setHours(potentialStart, timeOfDayFilter.endHour), 0)
                }) || !isBefore(potentialEnd, setMinutes(setHours(potentialStart, timeOfDayFilter.endHour), 0))) {
                    // If the slot doesn't fit within the part of day, skip to the next iteration
                    continue;
                }
            }

            // Ensure the potential free slot does not extend beyond the query's end time
            if (isAfter(potentialEnd, parseISO(queryEndTime))) {
                break;
            }

            // If the potential slot is long enough to accommodate the meeting, add it to the free slots list
            if (differenceInMinutes(potentialEnd, potentialStart) >= meetingDuration) {
                freeSlots.push({ start: potentialStart.toISOString(), end: potentialEnd.toISOString() });
                slotsFound++;  // Increment the count of found free slots
            }
        }

        // Update the last end time to the end of the current busy slot
        lastEndTime = isAfter(parseISO(slot.end), lastEndTime) ? parseISO(slot.end) : lastEndTime;
    }

    // Return the list of identified free slots
    return freeSlots;
}



module.exports = { findFreeSlots, preprocessBusySlots };