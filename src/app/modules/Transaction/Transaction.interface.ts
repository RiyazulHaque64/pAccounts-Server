import { Types } from 'mongoose';

export interface TTransaction {
  user: string;
  date: Date;
  title: string;
  sector: Types.ObjectId;
  account: Types.ObjectId;
  amount: number;
}
