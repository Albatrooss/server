import express from 'express';
import { createServer } from 'http';
import logger from './config/logger';
import socket from './socket';

const main = async () => {
  const app = express();
  const server = createServer(app);

  app.get('/', (_, res) => res.send(`Server is running`));

  server.listen(8081, () => {
    logger.info(`Server listening 🚀 🚀 🚀`);

    socket(server);
  });
};

export default main;
