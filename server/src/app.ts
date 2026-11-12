import { resolve } from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Container } from 'inversify';
import { config } from './config';
import { API_RATE_LIMIT_WINDOW_MS, JSON_BODY_LIMIT, MAX_API_REQUESTS_PER_WINDOW } from './constants';
import type { Controller } from './interfaces/controller';
import { errorHandler } from './middleware/http';
import { TYPES } from './types';

export function createApp(container: Container) {
  const app = express();
  app.disable('x-powered-by');
  // Security: without this, behind a proxy every visitor shares one rate limit bucket.
  if (config.trustProxyHops > 0) app.set('trust proxy', config.trustProxyHops);

  // Security headers. The Content Security Policy only allows our own scripts plus Google Fonts.
  app.use(helmet({
    contentSecurityPolicy: config.production
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            workerSrc: ["'self'", 'blob:'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
          },
        }
      : false,
  }));
  app.use(compression()); // perf Increase: gzip every response

  // For the host's health check. It does not touch the database, so it never wakes a sleeping one.
  app.get('/healthz', (_request, response) => {
    response.json({ status: 'ok' });
  });

  if (!config.production) {
    app.use(cors({ origin: config.clientOrigin, credentials: true }));
  }

  // Security: a broad limit on API calls per IP to slow down scraping and brute force.
  app.use(['/api', '/auth'], rateLimit({
    windowMs: API_RATE_LIMIT_WINDOW_MS,
    limit: MAX_API_REQUESTS_PER_WINDOW,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' },
  }));

  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  for (const controller of container.getAll<Controller>(TYPES.Controller)) {
    app.use(controller.basePath, controller.router());
  }

  if (config.production) {
    const buildFolder = resolve(__dirname, '../../client/build');
    // perf Increase: files in /assets have hashed names, so browsers can cache them for a year.
    app.use('/assets', express.static(resolve(buildFolder, 'assets'), { maxAge: '1y', immutable: true }));
    app.use(express.static(buildFolder, { index: false }));
    app.get('*', (_request, response) => {
      response.setHeader('Cache-Control', 'no-cache');
      response.sendFile(resolve(buildFolder, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
