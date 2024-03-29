
const CALENDAR_ID = '@group.calendar.google.com'; //removed hard coded
const API_KEY = ''; // removed

// Function to format a date in YYYY-MM-DD format
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to get the start and end time of a specific day
function getTimeRangeForDate(date) {
  const formattedDate = formatDate(date);
  const timeMin = `${formattedDate}T00:00:00Z`; // Start of the day in UTC
  const timeMax = `${formattedDate}T23:59:59Z`; // End of the day in UTC
  return { timeMin, timeMax };
}

// Function to fetch events for a specific day
async function fetchEventsForSpecificDay(date) {
  const { timeMin, timeMax } = getTimeRangeForDate(date);
  const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      console.log('Events on', formatDate(date), ':', data.items);
    } else {
      console.log('No events found on', formatDate(date));
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function queryEventsOnDate(dateString) {
  const specificDate = new Date(dateString);
  fetchEventsForSpecificDay(specificDate);
}

queryEventsOnDate('2024-03-29');