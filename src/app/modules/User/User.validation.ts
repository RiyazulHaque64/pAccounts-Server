import { z } from 'zod';
import { UserRole, UserStatus } from './User.const';

const createUserValidationShcema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'User name is must be required!',
      invalid_type_error: 'User name should be a string!',
    }),
    email: z
      .string({
        required_error: 'User email is must be required!',
        invalid_type_error: 'User email should be a string!',
      })
      .email({ message: 'This email is not a valid email!' }),
    role: z.enum([...UserRole] as [string]).default('user'),
    photoUrl: z
      .string({ invalid_type_error: 'Photo url should be a string!' })
      .optional(),
    status: z.enum([...UserStatus] as [string]).default('in-progress'),
  }),
});

export const UserValidations = {
  createUserValidationShcema,
};
