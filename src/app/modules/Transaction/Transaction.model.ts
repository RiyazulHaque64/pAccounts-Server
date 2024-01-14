import httpStatus from 'http-status';
import { Schema, Types, model } from 'mongoose';
import AppError from '../../error/AppError';
import { TransactionTypes } from './Transaction.const';
import { TTransaction, TransactionMethod } from './Transaction.interface';

const transactionSchema = new Schema<TTransaction, TransactionMethod>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User is required!'],
      ref: 'User',
    },
    date: {
      type: Date,
      default: new Date(),
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required!'],
    },
    transactionType: {
      type: String,
      enum: TransactionTypes,
      required: [true, 'Transaction type is required!'],
    },
    transferredAccount: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      default: new Types.ObjectId(),
    },
    sector: {
      type: Schema.Types.ObjectId,
      ref: 'Sector',
      default: new Types.ObjectId(),
    },
    transactor: {
      type: Schema.Types.ObjectId,
      ref: 'Transactor',
      default: new Types.ObjectId(),
    },
    account: {
      type: Schema.Types.ObjectId,
      required: [true, 'Account is required!'],
      ref: 'Account',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required!'],
    },
  },
  { timestamps: true },
);

// Transaction existence verification
transactionSchema.statics.isTransactionExists = async function (
  id: Types.ObjectId,
) {
  const checkTransaction = await Transaction.findById(id).populate(
    'user transferredAccount transactor sector account',
  );
  if (!checkTransaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Transaction doesn't exists!");
  }
  return checkTransaction;
};

const Transaction = model<TTransaction, TransactionMethod>(
  'Transaction',
  transactionSchema,
);

export default Transaction;
