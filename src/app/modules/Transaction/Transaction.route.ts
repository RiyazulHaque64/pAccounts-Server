import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { TransactionControllers } from './Transaction.controller';
import { TransactionValidations } from './Transaction.validation';

const router = Router();

router.post(
  '/',
  validateRequest(TransactionValidations.createTransactionValidationSchema),
  TransactionControllers.createTransaction,
);

export const TransactionRoutes = router;
