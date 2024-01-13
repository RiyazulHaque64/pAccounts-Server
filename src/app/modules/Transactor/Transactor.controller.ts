import httpStatus from 'http-status';
import { Types } from 'mongoose';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TransactorServices } from './Transactor.service';

const createTransactor = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await TransactorServices.createTransactorIntoDB(
    'riyazulhaque64@gmail.com',
    data,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Transactor is created successfully',
    data: result,
  });
});

const deleteTransactor = catchAsync(async (req, res) => {
  await TransactorServices.deleteTransactorFromDB(
    new Types.ObjectId(req.params.id),
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactor is deleted successfully',
    data: null,
  });
});

export const TransactorControllers = {
  createTransactor,
  deleteTransactor,
};
