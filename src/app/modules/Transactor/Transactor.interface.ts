import { Types } from 'mongoose';

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
