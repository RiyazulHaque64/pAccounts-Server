import { isValidNumber } from 'libphonenumber-js';
import { z } from 'zod';

const createTransactorValidationSchema = z.object({
  body: z.object({
    transactorName: z.string({
      required_error: 'Transactor name is required!',
      invalid_type_error: 'Transactor name will be a string!',
    }),
    reference: z
      .string({ invalid_type_error: 'Reference will be a string!' })
      .optional(),
    contactNumber: z
      .string({
        required_error: 'Contact number is required!',
        invalid_type_error: 'Contact number will be a string!',
      })
      .refine(
        (value) => isValidNumber(value),
        (value) => ({
          message: `${value} is not a valid contact number or without country code`,
        }),
      ),
  }),
});

export const TransactorValidations = {
  createTransactorValidationSchema,
};
