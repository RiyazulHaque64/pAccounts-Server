import httpStatus from 'http-status';
import { Types } from 'mongoose';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './User.service';

const createUser = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await UserServices.createUserIntoDB(data);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User is created successfully',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await UserServices.getSingleUserFromDB(
    new Types.ObjectId(req.params.id),
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved successfully',
    data: result,
  });
});

const getUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getUsersFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users are retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const result = await UserServices.updateUserIntoDB(
    'user',
    new Types.ObjectId(req.params.id),
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await UserServices.deleteUserIntoDB(new Types.ObjectId(req.params.id));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is deleted successfully',
    data: null,
  });
});

export const UserControllers = {
  createUser,
  deleteUser,
  getSingleUser,
  getUsers,
  updateUser,
};
