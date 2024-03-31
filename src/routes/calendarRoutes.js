const googleCalendarFactory = require('../services/googleCalendarService');

module.exports = async function (fastify, opts) {
  const googleCalendarService = googleCalendarFactory();

  // Associate a new calendar with an existing agent
  fastify.post('/agents/:agentId/calendar', async (request, reply) => {
    // Simulating the creation of a new calendar and association with the agentId
    const { agentId } = request.params;
    const calendar = await googleCalendarService.getCalendarByAgentId(agentId);
    if (!calendar) {
      // TOOD: Logic to create and associate a calendar if it doesn't exist
      // Just passing success for now
      return reply.send({ message: `New calendar created and associated with agent ${agentId}` });
    }
    return reply.send({ message: `A calendar already exists for agent ${agentId}` });
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
