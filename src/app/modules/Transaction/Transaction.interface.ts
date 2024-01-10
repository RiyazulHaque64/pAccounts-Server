import { Types } from 'mongoose';

export interface TTransaction {
  date: Date;
  title: string;
  sector: Types.ObjectId;
  account: Types.ObjectId;
  amount: number;
}
