import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { TransactorControllers } from './Transactor.controller';
import { TransactorValidations } from './Transactor.validation';

const router = Router();

router.post(
  '/',
  validateRequest(TransactorValidations.createTransactorValidationSchema),
  TransactorControllers.createTransactor,
);

router.delete('/:id', TransactorControllers.deleteTransactor);

export const TransactorRoutes = router;
