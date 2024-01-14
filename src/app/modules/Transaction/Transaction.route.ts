import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TransactionControllers } from './Transaction.controller';
import { TransactionValidations } from './Transaction.validation';

const router = Router();

router.post(
  '/',
  auth('user'),
  validateRequest(TransactionValidations.createTransactionValidationSchema),
  TransactionControllers.createTransaction,
);

router.get('/', auth('user'), TransactionControllers.getTransactions);

router.get('/:id', auth('user'), TransactionControllers.getSingleTransaction);

// router.put(
//   '/:id',
//   auth('user'),
//   validateRequest(TransactionValidations.updateTransactionValidationSchema),
//   TransactionControllers.updateTransaction,
// );

// router.delete('/:id', auth('user'), TransactionControllers.deleteTransaction);

export const TransactionRoutes = router;
