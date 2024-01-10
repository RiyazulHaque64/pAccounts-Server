import { Schema, model } from 'mongoose';
import { TTransaction } from './Transaction.interface';

const transactionSchema = new Schema<TTransaction>(
  {
    date: {
      type: Date,
      default: Date.now(),
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required!'],
    },
    sector: {
      type: Schema.Types.ObjectId,
      required: [true, 'Sector is required!'],
    },
    account: {
      type: Schema.Types.ObjectId,
      required: [true, 'Account is required!'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required!'],
    },
  },
  { timestamps: true },
);

const Transaction = model<TTransaction>('Transaction', transactionSchema);

export default Transaction;