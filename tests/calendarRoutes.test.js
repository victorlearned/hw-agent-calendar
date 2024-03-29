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
        url: '/agents/555/calendar',  // Use a test agentId, e.g., 123
        payload: {}  // Add any necessary payload for the test
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).message).toBe('New calendar created and associated with agent 555');
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

  describe('POST /agents/available-times/common', () => {
    it('should find common available times for provided agent IDs', async () => {
      const agentIds = ['123', '456']; // Example agent IDs, can include 10 or more
      const response = await app.inject({
        method: 'POST',
        url: '/agents/available-times/common',
        payload: { agentIds },
      });
  
      expect(response.statusCode).toBe(200);
      const commonTimes = JSON.parse(response.payload).commonTimes;
      expect(commonTimes).toEqual(expect.arrayContaining(['2023-04-03T10:00:00Z']));
    });
  });

});
