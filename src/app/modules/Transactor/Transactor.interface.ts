/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export interface TTransactor {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  transactorName: string;
  reference?: string;
  contactNumber: string;
  transaction: number;
  previousTransaction: number;
  isDeleted: boolean;
}

export interface TransactorMethod extends Model<TTransactor> {
  isTransactorExists(
    id: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<TTransactor> | null;
}
