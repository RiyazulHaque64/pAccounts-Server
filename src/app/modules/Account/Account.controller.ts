import httpStatus from 'http-status';
import { Types } from 'mongoose';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AccountServices } from './Account.service';

const createAccount = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await AccountServices.createAccountIntoDB(req.user, data);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Account is created successfully',
    data: result,
  });
});

const getAccounts = catchAsync(async (req, res) => {
  const result = await AccountServices.getAccountsFromDB(req.user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Accounts are retrieved successfully',
    data: result,
  });
});

const getSingleAccount = catchAsync(async (req, res) => {
  const result = await AccountServices.getSingleAccountFromDB(
    new Types.ObjectId(req.params.id),
    req.user,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Account is retrieved successfully',
    data: result,
  });
});

const updateAccount = catchAsync(async (req, res) => {
  const result = await AccountServices.updateAccountIntoDB(
    new Types.ObjectId(req.params.id),
    req.user,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Account is updated successfully',
    data: result,
  });
});

const deleteAccount = catchAsync(async (req, res) => {
  await AccountServices.deleteAccountFromDB(
    new Types.ObjectId(req.params?.id),
    req.user,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Account is deleted successfully',
    data: null,
  });
});

export const AccountControllers = {
  createAccount,
  deleteAccount,
  updateAccount,
  getAccounts,
  getSingleAccount,
};
