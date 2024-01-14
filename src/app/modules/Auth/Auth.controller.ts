import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './Auth.service';

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  res.cookie('accessToken', result, {
    httpOnly: true,
    secure: config.node_env === 'production',
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User login successfully',
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
};
