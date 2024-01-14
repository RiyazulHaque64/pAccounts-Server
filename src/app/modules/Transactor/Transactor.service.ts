import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { SearchableFields } from './Transactor.const';
import { TTransactor } from './Transactor.interface';
import Transactor from './Transactor.model';

const createTransactorIntoDB = async (
  user: JwtPayload,
  payload: TTransactor,
) => {
  const number = payload.contactNumber.split(' ').join('');
  payload.user = user._id;
  payload.contactNumber = number;
  const result = await Transactor.create(payload);
  return result;
};

const getTransactorsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const transactorQuery = new QueryBuilder(
    Transactor.find({ user: user._id, isDeleted: false }),
    query,
  )
    .search(SearchableFields)
    .filter()
    .sort()
    .limit()
    .paginate()
    .fields();
  const result = await transactorQuery.queryModel;
  return result;
};

const getSingleTransactorFromDB = async (
  id: Types.ObjectId,
  user: JwtPayload,
) => {
  const result = await Transactor.isTransactorExists(id, user._id);
  return result;
};

const updateTransactorIntoDB = async (
  id: Types.ObjectId,
  userId: JwtPayload,
  payload: TTransactor,
) => {
  await Transactor.isTransactorExists(id, userId._id);
  const { user, transaction, previousTransaction, ...remainingData } = payload;
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cann't update the user!");
  }
  if (
    (transaction && previousTransaction) ||
    transaction ||
    previousTransaction
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cann't update the transaction or previous transaction!",
    );
  }
  const result = await Transactor.findByIdAndUpdate(id, remainingData, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteTransactorFromDB = async (id: Types.ObjectId, user: JwtPayload) => {
  const transactor = await Transactor.isTransactorExists(id, user._id);
  const result = await Transactor.findByIdAndUpdate(id, {
    isDeleted: true,
    previousTransaction: transactor?.transaction,
  });
  return result;
};

export const TransactorServices = {
  createTransactorIntoDB,
  deleteTransactorFromDB,
  updateTransactorIntoDB,
  getSingleTransactorFromDB,
  getTransactorsFromDB,
};
