/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export interface TTransaction {
  user: Types.ObjectId;
  date: Date;
  title: string;
  transactionType:
    | 'income'
    | 'expense'
    | 'taken loan'
    | 'given loan'
    | 'pay loan'
    | 'return loan'
    | 'taken deposit'
    | 'add deposit'
    | 'return deposit'
    | 'deposit withdrawal'
    | 'account to account';
  field: Types.ObjectId;
  fieldType: string;
  account: Types.ObjectId;
  amount: number;
}

export interface TransactionMethod extends Model<TTransaction> {
  isTransactionExists(
    id: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<TTransaction> | null;
}
