import { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { FolderController } from './controllers/FolderController';
import { AuthController } from './controllers/AuthController';
import { MasterCardController } from './controllers/MasterCardController';
import { PoolCardController } from './controllers/PoolCardController';
import { ProfileController } from './controllers/ProfileController';
import { ReviewController } from './controllers/ReviewController';
import { SubCardController } from './controllers/SubCardController';
import type { Controller } from './interfaces/controller';
import { FolderService } from './services/FolderService';
import { ReviewService } from './services/ReviewService';
import { AuthService } from './services/AuthService';
import { MasterCardService } from './services/MasterCardService';
import { PoolCardService } from './services/PoolCardService';
import { SubCardService } from './services/SubCardService';
import { TYPES } from './types';

export function buildContainer(ds: DataSource) {
  const container = new Container({ defaultScope: 'Singleton' });
  container.bind<DataSource>(TYPES.DataSource).toConstantValue(ds);

  container.bind(TYPES.AuthService).to(AuthService);
  container.bind(TYPES.MasterCardService).to(MasterCardService);
  container.bind(TYPES.SubCardService).to(SubCardService);
  container.bind(TYPES.PoolCardService).to(PoolCardService);
  container.bind(TYPES.FolderService).to(FolderService);
  container.bind(TYPES.ReviewService).to(ReviewService);

  for (const ctrl of [
    AuthController,
    ProfileController,
    MasterCardController,
    SubCardController,
    PoolCardController,
    FolderController,
    ReviewController,
  ]) {
    container.bind<Controller>(TYPES.Controller).to(ctrl);
  }

  return container;
}
