const build = require('../src/app');  // Adjust the path as necessary

describe('Calendar Routes Tests', () => {
  let app;

  beforeAll(() => {
    app = build();
  });

  afterAll(() => {
    app.close();
  });

  describe('POST /agents/:agentId/calendar', () => {
    test('should associate a new calendar with an existing agent', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/agents/123/calendar',  // Use a test agentId, e.g., 123
        payload: {}  // Add any necessary payload for the test
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).message).toBe('New calendar associated with the agent');
    });
  });

  describe('GET /agents/:agentId/calendar/available-times', () => {
    test('should retrieve available times for an agent\'s calendar', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/agents/123/calendar/available-times',  // Use a test agentId
      });

      expect(response.statusCode).toBe(200);
      // Add more assertions based on the expected output
    });
  });

  describe('POST /agents/:agentId/calendar/appointments', () => {
    test('should add a new appointment to an agent\'s calendar', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/agents/123/calendar/appointments',  // Use a test agentId
        payload: {
          // Add necessary appointment details in the payload
        }
      });

      expect(response.statusCode).toBe(200);
      // Add more assertions based on the expected output
    });
  });

  describe('GET /agents/available-times/common', () => {
    test('should find common available times across multiple agents\' calendars', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/agents/available-times/common',  // This might need adjustments based on implementation
        // Add any necessary query parameters or payload
      });

      expect(response.statusCode).toBe(200);
      // Add more assertions based on the expected output
    });
  });

});
