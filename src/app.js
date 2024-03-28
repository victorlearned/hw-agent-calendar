// src/app.js
const Fastify = require('fastify');

function build(opts = {}) {
  const app = Fastify(opts);
  
  app.get('/', async (request, reply) => {
    return { hello: 'world' };
  });

  return app;
}

module.exports = build;
