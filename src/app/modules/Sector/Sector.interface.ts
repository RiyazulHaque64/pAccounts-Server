/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export interface TSector {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  sectorName: string;
  sectorType: 'income' | 'expense';
  parent: 'parent' | Types.ObjectId;
  transaction: number;
  previousTransaction: number;
  isDeleted: boolean;
}

export interface SectorMethod extends Model<TSector> {
  isSectorExists(
    id: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<TSector> | null;
}
