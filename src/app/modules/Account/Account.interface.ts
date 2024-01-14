/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export interface TAccount {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  accountName: string;
  accountType: 'bank' | 'mobile bank' | 'cash';
  balance: number;
  previousBalance: number;
  isDeleted: boolean;
}

export interface AccountMethod extends Model<TAccount> {
  isAccountExists(
    id: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<TAccount> | null;
}
