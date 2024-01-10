import { Model, Types } from 'mongoose';

export interface TTransaction {
  user: string;
  date: Date;
  title: string;
  sector: Types.ObjectId;
  account: Types.ObjectId;
  amount: number;
}

export interface TransactionMethod extends Model<TTransaction> {
  // eslint-disable-next-line no-unused-vars
  isTransactionExists(id: Types.ObjectId): Promise<TTransaction> | null;
}
