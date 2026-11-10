import { resolve } from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { Container } from 'inversify';
import { config } from './config';
import { JSON_BODY_LIMIT } from './constants';
import type { Controller } from './interfaces/controller';
import { errorHandler } from './middleware/http';
import { TYPES } from './types';

export function createApp(container: Container) {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());

  if (!config.production) {
    app.use(cors({ origin: config.clientOrigin, credentials: true }));
  }

  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  for (const controller of container.getAll<Controller>(TYPES.Controller)) {
    app.use(controller.basePath, controller.router());
  }

  if (config.production) {
    app.use(express.static(resolve(__dirname, '../../client/build')));
    app.get('*', (_req, res) => {
      res.sendFile(resolve(__dirname, '../../client/build', 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
