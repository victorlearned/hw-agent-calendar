const build = require('./app');

const app = build({ logger: true });

const start = async () => {
  try {
    await app.listen(3000);
    console.log(`Server is running at ${app.server.address().port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
