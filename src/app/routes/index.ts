import { Router } from 'express';
import { AccountRoutes } from '../modules/Account/Account.route';
import { SectorRoutes } from '../modules/Sector/Sector.route';

const router = Router();

const routes = [
  {
    path: '/accounts',
    routes: AccountRoutes,
  },
  {
    path: '/sectors',
    routes: SectorRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.routes));

export default router;
