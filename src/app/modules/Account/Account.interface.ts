import { Model } from 'mongoose';

export interface TAccount {
  user: string;
  accountName: string;
  accountType: 'bank' | 'mobile bank' | 'cash';
  balance: number;
  previousBalance: number;
  isDeleted: boolean;
}

export interface AccountMethod extends Model<TAccount> {
  // eslint-disable-next-line no-unused-vars
  isAccountExists(id: string): Promise<TAccount> | null;
}
