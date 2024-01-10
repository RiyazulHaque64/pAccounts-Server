import { Model, Types } from 'mongoose';

export interface TSector {
  _id: Types.ObjectId;
  user: string;
  sectorName: string;
  sectorType: 'income' | 'expense';
  parent: 'parent' | Types.ObjectId;
  transaction: number;
  previousTransaction: number;
  isDeleted: boolean;
}

export interface SectorMethod extends Model<TSector> {
  // eslint-disable-next-line no-unused-vars
  isSectorExists(id: Types.ObjectId): Promise<TSector> | null;
}
