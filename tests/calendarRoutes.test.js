jest.mock('../src/services/googleCalendarService', () => {
  const googleCalendarServiceFactory = jest.fn().mockImplementation(() => ({
    getCalendarByAgentId: jest.fn(async (agentId) => {
      if (agentId === '123') {
        return { calendarId: 'calendar-123' };
      } else {
        return null;
      }
    }),
    findAvailableTimes: jest.fn(async (agentId) => {
      if (agentId === '123') {
        return ['2023-04-01T12:00:00Z'];
      } else {
        return [];
      }
    }),
    addAppointment: jest.fn(async (agentId, appointmentDetails) => {
      if (agentId === '123') {
        return { message: 'Appointment added successfully' };
      } else {
        return { message: 'Agent calendar not found' };
      }
    }),
    findCommonAvailableTimes: jest.fn(async (agentIds) => {
      return ['2023-04-03T10:00:00Z'];
    }),
    calendarExists: jest.fn(async (calendarId) => {
      return calendarId === 'calendar-123';
    }),
  }));

  return googleCalendarServiceFactory;
});


const build = require('../src/app');

describe('calendarRoutes', () => {
  let app;
  let mockDynamodb;

  beforeAll(async () => {
    mockDynamodb = new Map();
    app = build({ mockDynamodb });

  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /agents/:agentId/calendar should associate calendar with agent if calendar exists', async () => {
    // Mock agent data
    const agentId = '123';
    const calendarId = 'calendar-123';

    // Send request to associate calendar with agent
    const response = await app.inject({
      method: 'POST',
      url: `/agents/${agentId}/calendar`,
      payload: { calendarId },
    });

    // Assert that the association was successful
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: `Calendar ${calendarId} associated with agent ${agentId}` });

    // Assert that the agent's calendar was updated in mockDynamodb
    expect(mockDynamodb.get(agentId)).toEqual({ calendarId });
  });


});