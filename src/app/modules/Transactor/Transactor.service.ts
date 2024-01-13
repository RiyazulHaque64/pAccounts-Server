import { Types } from 'mongoose';
import { TTransactor } from './Transactor.interface';
import Transactor from './Transactor.model';

const createTransactorIntoDB = async (user: string, payload: TTransactor) => {
  const number = payload.contactNumber.split(' ').join('');
  payload.user = user;
  payload.contactNumber = number;
  const result = await Transactor.create(payload);
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
};
