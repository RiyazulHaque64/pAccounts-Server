import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserControllers } from './User.controllers';
import { UserValidations } from './User.validation';

const router = Router();

router.post(
  '/',
  validateRequest(UserValidations.createUserValidationShcema),
  UserControllers.createUser,
);

router.get('/', auth('admin'), UserControllers.getUsers);

router.get('/:id', auth('user', 'admin'), UserControllers.getSingleUser);

router.put(
  '/:id',
  auth('user', 'admin'),
  validateRequest(UserValidations.updateUserValidationShcema),
  UserControllers.updateUser,
);

router.delete('/:id', auth('admin'), UserControllers.deleteUser);

export const UserRoutes = router;
