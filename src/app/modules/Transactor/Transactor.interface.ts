import { Model, Types } from 'mongoose';

export interface TTransactor {
  _id: Types.ObjectId;
  user: string;
  transactorName: string;
  reference?: string;
  contactNumber: string;
  transaction: number;
  previousTransaction: number;
  isDeleted: boolean;
}

export interface TransactorMethod extends Model<TTransactor> {
  // eslint-disable-next-line no-unused-vars
  isTransactorExists(id: Types.ObjectId): Promise<TTransactor> | null;
}
