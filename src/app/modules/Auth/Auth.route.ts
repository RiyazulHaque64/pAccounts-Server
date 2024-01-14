import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthControllers } from './Auth.controller';
import { AuthValidations } from './Auth.validation';

const router = Router();

router.post(
  '/login',
  validateRequest(AuthValidations.loginValidationSchema),
  AuthControllers.loginUser,
);

export const AuthRoutes = router;
