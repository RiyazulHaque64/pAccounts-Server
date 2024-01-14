import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../error/AppError';
import createToken, { TJwtPayload } from '../../utils/createToken';
import User from '../User/User.model';
import { TLogin } from './Auth.interface';

const loginUser = async (payload: TLogin) => {
  const user = await User.findOne(payload).select('+isDeleted');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't not exists!");
  }
  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }
  if (user?.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }
  const jwtPayload: TJwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiredIn,
  );
  return accessToken;
};

export const AuthServices = {
  loginUser,
};
