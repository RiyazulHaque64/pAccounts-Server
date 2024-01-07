import { z } from 'zod';
import { AccountType } from './Account.constant';

const createAccountValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Account name is must be required!',
      invalid_type_error: 'Account name is must be in string',
    }),
    type: z.enum([...AccountType] as [string], {
      required_error: 'Account type is required!',
    }),
    balance: z
      .number({ invalid_type_error: 'Balance is must be a number' })
      .default(0),
    isDeleted: z.boolean().default(false),
  }),
});

const updateAccountValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: 'Account name is must be in string',
      })
      .optional(),
    type: z.enum([...AccountType] as [string]).optional(),
    balance: z
      .number({ invalid_type_error: 'Balance is must be a number' })
      .optional(),
  }),
});

export const AccountValidations = {
  createAccountValidationSchema,
  updateAccountValidationSchema,
};
