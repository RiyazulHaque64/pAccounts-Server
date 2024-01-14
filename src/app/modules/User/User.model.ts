import httpStatus from 'http-status';
import { Schema, Types, model } from 'mongoose';
import AppError from '../../error/AppError';
import { UserRole, UserStatus } from './User.const';
import { TUser, UserMethod } from './User.interface';

const userSchema = new Schema<TUser, UserMethod>(
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

userSchema.statics.isUserExists = async function (id: Types.ObjectId) {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exists");
  }
  return user;
};

const User = model<TUser, UserMethod>('User', userSchema);
export default User;
