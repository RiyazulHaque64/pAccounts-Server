import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AccountServices } from './Account.service';

const createAccount = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await AccountServices.createAccountIntoDB(
    'riyazulhaque64@gmail.com',
    data,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Account is created successfully',
    data: result,
  });
});

const getAccounts = catchAsync(async (req, res) => {
  const result = await AccountServices.getAccountsFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Accounts are retrieved successfully',
    data: result,
  });
});

const getSingleAccount = catchAsync(async (req, res) => {
  const result = await AccountServices.getSingleAccountFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Account is retrieved successfully',
    data: result,
  });
});

const updateAccount = catchAsync(async (req, res) => {
  const result = await AccountServices.updateAccountIntoDB(
    req.params.id,
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
  await AccountServices.deleteAccountFromDB(req.params?.id);
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
