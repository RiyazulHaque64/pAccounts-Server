import httpStatus from 'http-status';
import { Types } from 'mongoose';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TransactorServices } from './Transactor.service';

const createTransactor = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await TransactorServices.createTransactorIntoDB(
    req.user,
    data,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Transactor is created successfully',
    data: result,
  });
});

const getTransactors = catchAsync(async (req, res) => {
  const result = await TransactorServices.getTransactorsFromDB(
    req.user,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactors are retrieved successfully',
    data: result,
  });
});

const getSingleTransactor = catchAsync(async (req, res) => {
  const result = await TransactorServices.getSingleTransactorFromDB(
    new Types.ObjectId(req.params.id),
    req.user,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactor is retrieved successfully',
    data: result,
  });
});

const updateTransactor = catchAsync(async (req, res) => {
  const result = await TransactorServices.updateTransactorIntoDB(
    new Types.ObjectId(req.params.id),
    req.user,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactor is updated successfully',
    data: result,
  });
});

const deleteTransactor = catchAsync(async (req, res) => {
  await TransactorServices.deleteTransactorFromDB(
    new Types.ObjectId(req.params.id),
    req.user,
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
  updateTransactor,
  getSingleTransactor,
  getTransactors,
};
