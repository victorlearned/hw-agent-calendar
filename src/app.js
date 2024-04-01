const fastify = require('fastify');
const calendarRoutes = require('./routes/calendarRoutes');

function build(opts = {}) {
  const app = fastify(opts);
  const { mockDynamodb = {} } = opts;

  app.register(calendarRoutes, { mockDynamodb });

  return app;
}

module.exports = build;
