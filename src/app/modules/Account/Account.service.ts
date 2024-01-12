import httpStatus from 'http-status';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { AccountSearchableField } from './Account.constant';
import { TAccount } from './Account.interface';
import Account from './Account.model';

const createAccountIntoDB = async (user: string, payload: TAccount) => {
  payload.user = user;
  const result = await Account.create(payload);
  return result;
};

const getAccountsFromDB = async (
  user: string,
  query: Record<string, unknown>,
) => {
  const accountQuery = new QueryBuilder(
    Account.find({ user, isDeleted: false }),
    query,
  )
    .search(AccountSearchableField)
    .filter()
    .sort()
    .limit()
    .paginate()
    .fields();
  const result = await accountQuery.queryModel;
  // const result = await Account.find().limit(2);
  return result;
};

const getSingleAccountFromDB = async (id: Types.ObjectId) => {
  const result = await Account.isAccountExists(id);
  return result;
};

const updateAccountIntoDB = async (id: Types.ObjectId, payload: TAccount) => {
  const { user, previousBalance, ...remainingData } = payload;
  const account = await Account.isAccountExists(id);
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cann't update the user!");
  }
  if (previousBalance) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cann't update the previous balance!",
    );
  }
  const updateData: Partial<TAccount> = {
    ...remainingData,
  };
  if (remainingData?.balance) {
    updateData.previousBalance = account?.balance;
  }
  const result = await Account.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteAccountFromDB = async (id: Types.ObjectId) => {
  const account = await Account.isAccountExists(id);
  const result = await Account.findByIdAndUpdate(id, {
    previousBalance: account?.balance,
    balance: 0,
    isDeleted: true,
  });
  return result;
};

export const AccountServices = {
  createAccountIntoDB,
  deleteAccountFromDB,
  updateAccountIntoDB,
  getAccountsFromDB,
  getSingleAccountFromDB,
};
