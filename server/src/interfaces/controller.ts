import type { Router } from 'express';

export interface Controller {
  basePath: string;
  router(): Router;
}
