import { Schema, model } from 'mongoose';
import { UserRole, UserStatus } from './User.const';
import { TUser } from './User.interface';

const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required!'],
      maxlength: [30, 'User name should be maximum 30 characters!'],
    },
    email: {
      type: String,
      required: [true, 'User email is required!'],
      unique: true,
    },
    role: {
      type: String,
      enum: UserRole,
      default: 'user',
    },
    photoUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: UserStatus,
      default: 'in-progress',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: 0,
    },
  },
  {
    timestamps: true,
  },
);

const User = model<TUser>('User', userSchema);
export default User;
