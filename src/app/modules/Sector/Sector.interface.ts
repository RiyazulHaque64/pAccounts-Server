import { Model } from 'mongoose';

export interface TSector {
  user: string;
  sectorName: string;
  sectorType: 'income' | 'expense';
  parent: string;
  transaction: number;
  previousTransaction: number;
  isDeleted: boolean;
}

export interface SectorMethod extends Model<TSector> {
  // eslint-disable-next-line no-unused-vars
  isSectorExists(id: string): Promise<TSector> | null;
}
