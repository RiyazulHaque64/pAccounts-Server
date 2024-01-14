import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import AppError from '../../error/AppError';
import { TUser } from './User.interface';
import User from './User.model';

const createUserIntoDB = async (payload: TUser) => {
  const result = await User.create(payload);
  return result;
};

const getUsersFromDB = async () => {
  const result = await User.find({ isDeleted: false });
  return result;
};

const getSingleUserFromDB = async (id: Types.ObjectId) => {
  const result = await User.isUserExists(id);
  return result;
};

const updateUserIntoDB = async (
  user: JwtPayload,
  id: Types.ObjectId,
  payload: TUser,
) => {
  const { email, role, status, isDeleted, ...remainingData } = payload;
  if (user.role === 'user' && (email || role || status || isDeleted)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can update only your name & photo',
    );
  }
  if (user.role === 'user') {
    const result = await User.findByIdAndUpdate(id, remainingData, {
      new: true,
      runValidators: true,
    });
    return result;
  }
  const result = await User.findByIdAndUpdate(
    id,
    { email, role, status, isDeleted },
    { new: true, runValidators: true },
  );
  return result;
};

const deleteUserIntoDB = async (id: Types.ObjectId) => {
  const result = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true, runValidators: true },
  );
  return result;
};

export const UserServices = {
  createUserIntoDB,
  deleteUserIntoDB,
  getSingleUserFromDB,
  getUsersFromDB,
  updateUserIntoDB,
};
