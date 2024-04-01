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

  // Find available times in an agent's calendar
  // TODO update for range & time segments
  fastify.get('/agents/:agentId/calendar/available-times', async (request, reply) => {
    const { agentId } = request.params;
    const availableTimes = await googleCalendarService.findAvailableTimes(agentId);
    return reply.send({ agentId, availableTimes });
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
