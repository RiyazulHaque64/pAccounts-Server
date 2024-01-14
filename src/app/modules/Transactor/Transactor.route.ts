import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TransactorControllers } from './Transactor.controller';
import { TransactorValidations } from './Transactor.validation';

const router = Router();

router.post(
  '/',
  auth('user'),
  validateRequest(TransactorValidations.createTransactorValidationSchema),
  TransactorControllers.createTransactor,
);

router.get('/', auth('user'), TransactorControllers.getTransactors);

router.get('/:id', auth('user'), TransactorControllers.getSingleTransactor);

router.put(
  '/:id',
  auth('user'),
  validateRequest(TransactorValidations.updateTransactorValidationSchema),
  TransactorControllers.updateTransactor,
);

router.delete('/:id', auth('user'), TransactorControllers.deleteTransactor);

export const TransactorRoutes = router;
