import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserControllers } from './User.controllers';
import { UserValidations } from './User.validation';

const router = Router();

router.post(
  '/',
  validateRequest(UserValidations.createUserValidationShcema),
  UserControllers.createUser,
);

export const UserRoutes = router;
