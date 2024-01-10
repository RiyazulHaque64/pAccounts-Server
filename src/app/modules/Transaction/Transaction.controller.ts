import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TransactionServices } from './Transaction.service';

const createTransaction = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await TransactionServices.createTransactionIntoDB(
    'riyazulhaque64@gmail.com',
    data,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Transaction is created successfully',
    data: result,
  });
});

export const TransactionControllers = {
  createTransaction,
};
