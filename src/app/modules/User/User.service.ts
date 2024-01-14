import { Types } from 'mongoose';
import { TUser } from './User.interface';
import User from './User.model';

const createUserIntoDB = async (payload: TUser) => {
  const result = await User.create(payload);
  return result;
};

const getSingleUserFromDB = async (id: Types.ObjectId) => {
  const result = await User.isUserExists(id);
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
};
