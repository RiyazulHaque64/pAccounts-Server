import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AccountControllers } from './Account.controller';
import { AccountValidations } from './Account.validation';

const router = Router();

router.post(
  '/',
  validateRequest(AccountValidations.createAccountValidationSchema),
  AccountControllers.createAccount,
);

router.get('/', AccountControllers.getAccounts);

router.get('/:id', AccountControllers.getSingleAccount);

router.put(
  '/:id',
  validateRequest(AccountValidations.updateAccountValidationSchema),
  AccountControllers.updateAccount,
);

router.delete('/:id', AccountControllers.deleteAccount);

export const AccountRoutes = router;
