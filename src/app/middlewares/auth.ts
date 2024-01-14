import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../error/AppError';
import { UserRole } from '../modules/User/User.const';
import User from '../modules/User/User.model';
import catchAsync from '../utils/catchAsync';

const auth = (...requiredRoles: typeof UserRole) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }
    const decoded = jwt.verify(token, config.jwt_access_secret) as JwtPayload;
    const { _id, role } = decoded;
    const user = await User.isUserExists(_id);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User doesn't exists!");
    }
    if (user?.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
    }
    if (user?.status === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
    }
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }
    req.user = decoded;
    next();
  });
};

export default auth;
