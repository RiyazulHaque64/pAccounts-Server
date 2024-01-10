import { TTransaction } from './Transaction.interface';
import Transaction from './Transaction.model';

const createTransactionIntoDB = async (user: string, payload: TTransaction) => {
  payload.user = user;
  const result = await Transaction.create(payload);
  return result;
};

export const TransactionServices = {
  createTransactionIntoDB,
};
