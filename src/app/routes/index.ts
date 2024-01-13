import { Router } from 'express';
import { AccountRoutes } from '../modules/Account/Account.route';
import { SectorRoutes } from '../modules/Sector/Sector.route';
import { TransactionRoutes } from '../modules/Transaction/Transaction.route';
import { TransactorRoutes } from '../modules/Transactor/Transactor.route';

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
  {
    path: '/transactions',
    routes: TransactionRoutes,
  },
  {
    path: '/transactors',
    routes: TransactorRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.routes));

export default router;
