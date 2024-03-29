
  module.exports = async function (fastify, opts) {

    // Associate a new calendar with an existing agent
    fastify.post('/agents/:agentId/calendar', async (request, reply) => {
      // TODO logic
      return { message: 'New calendar associated with the agent' };
    });
  
    // Find available times in an agent's calendar
    fastify.get('/agents/:agentId/calendar/available-times', async (request, reply) => {
      // TODO logic
      return { message: 'Available times retrieved for the agent\'s calendar' };
    });
  
    // Add a new appointment to an agent's calendar
    fastify.post('/agents/:agentId/calendar/appointments', async (request, reply) => {
      // TODO logic
      return { message: 'Appointment added to the agent\'s calendar' };
    });
  
    // Find common available times across multiple agents' calendars
    fastify.get('/agents/available-times/common', async (request, reply) => {
      // TODO logic
      // TNeed to handle multiple agent IDs to compare their calendars
      return { message: 'Common available times found across agents\' calendars' };
    });
  
  };
  