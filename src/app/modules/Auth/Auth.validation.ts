import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'User email is must be required!',
        invalid_type_error: 'User email should be a string!',
      })
      .email({ message: 'This email is not a valid email!' }),
  }),
});

export const AuthValidations = {
  loginValidationSchema,
};
