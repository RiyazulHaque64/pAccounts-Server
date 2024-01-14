import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AccountControllers } from './Account.controller';
import { AccountValidations } from './Account.validation';

const router = Router();

router.post(
  '/',
  auth('user'),
  validateRequest(AccountValidations.createAccountValidationSchema),
  AccountControllers.createAccount,
);

router.get('/', auth('user'), AccountControllers.getAccounts);

router.get('/:id', auth('user'), AccountControllers.getSingleAccount);

router.put(
  '/:id',
  auth('user'),
  validateRequest(AccountValidations.updateAccountValidationSchema),
  AccountControllers.updateAccount,
);

router.delete('/:id', auth('user'), AccountControllers.deleteAccount);

export const AccountRoutes = router;
