const googleCalendarServiceFactory = require('../services/googleCalendarService');

module.exports = async function (fastify, options) {
  const { mockDynamodb } = options;
  const googleCalendarService = googleCalendarServiceFactory();

  // Associate a new calendar with an existing agent
  fastify.post('/agents/:agentId/calendar', async (request, reply) => {
    const { agentId } = request.params;
    const { calendarId } = request.body;

    if (!calendarId) {
      return reply.status(400).send({ error: 'Calendar ID is required.' });
    }
    console.log('before google call ', calendarId);
    // Verify if the calendar exists using googleCalendarService
    const exists = await googleCalendarService.calendarExists(calendarId);

    console.log('AFTER google call', exists);
    if (!exists) {
      return reply.status(404).send({ error: 'Calendar does not exist.' });
    }

    // Check if the agent already has a calendar associated
    // Only allowing an agent to have 1 though could expand with smarter sortKey
    if (mockDynamodb.has(agentId)) {
      return reply.status(400).send({ error: `Agent ${agentId} already has a calendar associated.` });
    }

    // Associate the calendar with the agent
    mockDynamodb.set(agentId, { calendarId });
    return reply.send({ message: `Calendar ${calendarId} associated with agent ${agentId}` });
  });

/**
 * POST /calendars/:calendarId/available-times
 * Endpoint to find available times in a calendar.
 * 
 * @param {string} agentId - The ID of the agent whose availability is being queried.
 * @param {string} queryStartTime - The start time of the query range (ISO 8601 format).
 * @param {string} queryEndTime - The end time of the query range (ISO 8601 format).
 * @param {number} meetingDuration - The duration of the meeting in minutes.
 * @param {number} maxSlots - The maximum number of available slots to return.
 * @param {string} partOfDay - (Optional) The part of the day to filter the available times ('morning', 'afternoon', 'evening').
 * 
 * @returns {Object} Response object containing the calendar ID and an array of available time slots.
 */
    fastify.post('/agents/:agentId/calendar/available-times', async (request, reply) => {
      const { agentId } = request.params;
      const { queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay } = request.body;
      //
      if (mockDynamodb.has(agentId)) {
        return reply.status(400).send({ error: `Agent ${agentId} already has a calendar associated.` });
      }

      const { calendarId } = mockDynamodb.get(agentId);

      // Get busy slots from Google Calendar service
      const freeSlots = await googleCalendarService.findAvailableTimes({calendarId, queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay });
      return reply.send({ agentId, freeSlots });
    });

  // Add a new appointment to an agent's calendar
  fastify.post('/agents/:agentId/calendar/appointments', async (request, reply) => {
    const { agentId } = request.params;
    const appointmentDetails = request.body; // Details should be passed in the request body
    const result = await googleCalendarService.addAppointment(agentId, appointmentDetails);
    return reply.send(result);
  });

  // Find common available times across multiple agents' calendars
  // TODO add extra body props for n times, [evenin, morning, afternoon] etc
  fastify.post('/agents/available-times/common', async (request, reply) => {
    // swapped from GET just for future flexibility. Not sure a group of agents
    // would ever use this to schedule a large gathering though. Seems like really 1:1 buyer : seller agent
    try {
      const { agentIds } = request.body; // Expecting agent IDs in the request body
      if (!agentIds || !agentIds.length) {
        return reply.status(400).send({ error: 'Agent IDs are required' });
      }
      const commonTimes = await googleCalendarService.findCommonAvailableTimes(agentIds);
      return reply.send({ commonTimes });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};
