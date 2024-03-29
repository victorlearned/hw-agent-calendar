function googleCalendarService() {
    // Hardcoded data for demonstration purposes
    const calendars = {
      '123': { // Assuming '123' is an agentId
        calendarId: 'calendar-123',
        events: [
          { id: 'event-1', start: '2023-04-01T10:00:00Z', end: '2023-04-01T11:00:00Z', summary: 'Event 1' },
          { id: 'event-2', start: '2023-04-02T15:00:00Z', end: '2023-04-02T16:00:00Z', summary: 'Event 2' }
        ]
      }
    };
  
    async function getCalendarByAgentId(agentId) {
      return calendars[agentId] || null;
    }
  
    async function findAvailableTimes(agentId) {
      if (calendars[agentId]) {
        return ['2023-04-01T12:00:00Z', '2023-04-02T17:00:00Z']; // Hardcoded available times
      }
      return [];
    }
  
    async function addAppointment(agentId, appointmentDetails) {
      if (calendars[agentId]) {
        calendars[agentId].events.push(appointmentDetails);
        return { message: 'Appointment added successfully', appointmentDetails };
      }
      return { message: 'Agent calendar not found' };
    }
  
    async function findCommonAvailableTimes(agentIds) {
      return ['2023-04-03T10:00:00Z']; // Hardcoded common available time
    }
  
    // Exposing public API
    return {
      getCalendarByAgentId,
      findAvailableTimes,
      addAppointment,
      findCommonAvailableTimes,
    };
  }
  
  module.exports = googleCalendarService;
  