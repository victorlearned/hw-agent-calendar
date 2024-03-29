const fastify = require('fastify');
const calendarRoutes = require('./routes/calendarRoutes');

function build(opts = {}) {
  const app = fastify(opts);

  app.register(calendarRoutes);

  return app;
}

module.exports = build;
