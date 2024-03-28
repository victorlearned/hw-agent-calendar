// tests/app.test.js
const build = require('../src/app');

describe('GET /', () => {
  let app;

  beforeAll(() => {
    app = build();
  });

  afterAll(() => {
    app.close();
  });

  test('It should respond with { hello: "world" }', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ hello: 'world' });
  });
});
