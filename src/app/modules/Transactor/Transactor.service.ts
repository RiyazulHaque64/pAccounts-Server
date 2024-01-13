import httpStatus from 'http-status';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { SearchableFields } from './Transactor.const';
import { TTransactor } from './Transactor.interface';
import Transactor from './Transactor.model';

const createTransactorIntoDB = async (user: string, payload: TTransactor) => {
  const number = payload.contactNumber.split(' ').join('');
  payload.user = user;
  payload.contactNumber = number;
  const result = await Transactor.create(payload);
  return result;
};

const getTransactorsFromDB = async (
  user: string,
  query: Record<string, unknown>,
) => {
  const transactorQuery = new QueryBuilder(
    Transactor.find({ user, isDeleted: false }),
    query,
  )
    .search(SearchableFields)
    .filter();
  const result = await transactorQuery.queryModel;
  return result;
};

const getSingleTransactorFromDB = async (id: Types.ObjectId) => {
  const result = await Transactor.isTransactorExists(id);
  return result;
};

const updateTransactorIntoDB = async (
  id: Types.ObjectId,
  payload: TTransactor,
) => {
  await Transactor.isTransactorExists(id);
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

const deleteTransactorFromDB = async (id: Types.ObjectId) => {
  const transactor = await Transactor.isTransactorExists(id);
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
