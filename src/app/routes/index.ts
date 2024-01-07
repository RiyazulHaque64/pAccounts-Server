import { Router } from 'express';
import { AccountRoutes } from '../modules/Account/Account.route';

const router = Router();

const routes = [
  {
    path: '/accounts',
    routes: AccountRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.routes));

export default router;
