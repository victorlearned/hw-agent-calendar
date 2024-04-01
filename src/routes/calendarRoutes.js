const googleCalendarServiceFactory = require('../services/googleCalendarService');



module.exports = async function (fastify, options) {
  const { mockDynamodb } = options;
  const googleCalendarService = googleCalendarServiceFactory();

  /**
 * Handler for creating or associating a calendar with an agent.
 * @param {Object} request - The request object containing parameters and body.
 * @param {Object} request.params - Parameters extracted from the request URL.
 * @param {string} request.params.agentId - The ID of the agent.
 * @param {Object} request.body - The body of the request containing data.
 * @param {string} request.body.calendarId - The ID of the calendar to associate with the agent.
 * @param {Object} reply - The reply object used to send responses.
 * @returns {Object} Returns an HTTP response indicating the result of the operation.
 */
  fastify.post('/agents/:agentId/calendar', async (request, reply) => {
    const { agentId } = request.params;
    const { calendarId } = request.body;

    if (!calendarId) {
      return reply.status(400).send({ error: 'Calendar ID is required.' });
    }
    console.log('before google call ', calendarId);
    console.log('before google call agentId', agentId);

    // Verify if the calendar exists using googleCalendarService
    const exists = await googleCalendarService.getCalendarByAgentId(agentId);

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
    try {
      const { agentId } = request.params;
      const { queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay } = request.body;
      
      // Ensure we have a calendar
      if (!mockDynamodb.has(agentId)) {
        return reply.status(400).send({ error: `Calendar for Agent ${agentId} does not exist.` });
      }

      const { calendarId } = mockDynamodb.get(agentId);

      // Get busy slots from Google Calendar service
      const freeSlots = await googleCalendarService.findAvailableTimes({ calendarIds: [calendarId], queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay });
      return reply.send({ agentId, freeSlots });
    } catch (error) {
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

/**
 * Handle POST requests to create appointments for a specific agent.
 * @param {Object} request - The request object.
 * @param {Object} reply - The reply object.
 * @returns {Object} The response containing the result of the appointment creation.
 */
  fastify.post('/agents/:agentId/calendar/appointments', async (request, reply) => {
    const { agentId } = request.params;
    const appointmentDetails = request.body; // Details should be passed in the request body
    const result = await googleCalendarService.addAppointmentToCalendars(agentId, appointmentDetails);
    return reply.send(result);
  });

  // Find common available times across multiple agents' calendars
  fastify.post('/agents/available-times/common', async (request, reply) => {
    // not sure would ever use this to schedule a large gathering though. Seems like really 1:1 buyer : seller agent
    try {
       // Expecting an array of agent IDs in the request body
      const { agentIds, queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay } = request.body;
      if (!agentIds || !agentIds.length) {
        return reply.status(400).send({ error: 'Agent IDs are required' });
      }

      // TODO check that each agent ID has a calendar we can query

      // Get busy slots from Google Calendar service
      const freeSlots = await googleCalendarService.findAvailableTimes({ calendarId, queryStartTime, queryEndTime, meetingDuration, maxSlots, partOfDay });
      return reply.send({ agentId, freeSlots });

    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};
