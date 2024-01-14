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

router.get('/:id', UserControllers.getSingleUser);

router.delete('/:id', UserControllers.deleteUser);

export const UserRoutes = router;
