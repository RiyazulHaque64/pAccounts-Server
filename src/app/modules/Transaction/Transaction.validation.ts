import { z } from 'zod';
import { TransactionTypes } from './Transaction.const';

const createTransactionValidationSchema = z.object({
  body: z.object({
    date: z.coerce
      .date({
        invalid_type_error: 'Date must be in date format',
        required_error: 'Date is required!',
      })
      .default(new Date()),
    title: z.string({
      required_error: 'Transaction title is required!',
      invalid_type_error: 'Transaction title must be in string!',
    }),
    transactionType: z.enum([...TransactionTypes] as [string]),
    account: z.string({
      required_error: 'Account is required!',
      invalid_type_error: 'Account must be in string!',
    }),
    amount: z.number({
      required_error: 'Amount is required!',
      invalid_type_error: 'Amount must be a number!',
    }),
  }),
});

const updateTransactionValidationSchema = z.object({
  body: z.object({
    date: z.coerce
      .date({
        invalid_type_error: 'Date must be in date format',
        required_error: 'Date is required!',
      })
      .optional(),
    title: z
      .string({
        required_error: 'Transaction title is required!',
        invalid_type_error: 'Transaction title must be in string!',
      })
      .optional(),
    transactionType: z.enum([...TransactionTypes] as [string]).optional(),
    field: z.string({
      required_error: 'Sector is required!',
      invalid_type_error: 'Sector must be in string!',
    }),
    account: z.string({
      required_error: 'Account is required!',
      invalid_type_error: 'Account must be in string!',
    }),
    amount: z.number({
      required_error: 'Amount is required!',
      invalid_type_error: 'Amount must be a number!',
    }),
  }),
});

export const TransactionValidations = {
  createTransactionValidationSchema,
  updateTransactionValidationSchema,
};
