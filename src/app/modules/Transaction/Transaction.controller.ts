import httpStatus from 'http-status';
// import { Types } from 'mongoose';
import { Types } from 'mongoose';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TransactionServices } from './Transaction.service';

const createTransaction = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await TransactionServices.createTransactionIntoDB(
    req.user,
    data,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Transaction is created successfully',
    data: result,
  });
});

const getTransactions = catchAsync(async (req, res) => {
  const result = await TransactionServices.getTransactionsFromDB(
    req.user,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactions are retrieved successfully',
    data: result,
  });
});

const getSingleTransaction = catchAsync(async (req, res) => {
  const result = await TransactionServices.getSingleTransactionFromDB(
    new Types.ObjectId(req.params.id),
    req.user,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction is retrieved successfully',
    data: result,
  });
});

const updateTransaction = catchAsync(async (req, res) => {
  const result = await TransactionServices.updateTransactionIntoDB(
    new Types.ObjectId(req.params.id),
    req.user,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction is updated successfully',
    data: result,
  });
});

const deleteTransaction = catchAsync(async (req, res) => {
  await TransactionServices.deleteTransactionFromDB(
    new Types.ObjectId(req.params.id),
    req.user,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction is deleted successfully',
    data: null,
  });
});

export const TransactionControllers = {
  createTransaction,
  deleteTransaction,
  getSingleTransaction,
  updateTransaction,
  getTransactions,
};
