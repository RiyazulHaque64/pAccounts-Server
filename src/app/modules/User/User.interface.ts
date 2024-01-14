import { Model, Types } from 'mongoose';

export interface TUser {
  name: string;
  email: string;
  role: 'user' | 'admin';
  photoUrl: string;
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
}

export interface UserMethod extends Model<TUser> {
  // eslint-disable-next-line no-unused-vars
  isUserExists(id: Types.ObjectId): Promise<TUser> | null;
}
