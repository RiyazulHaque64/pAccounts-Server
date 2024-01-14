import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { AccountSearchableField } from './Account.constant';
import { TAccount } from './Account.interface';
import Account from './Account.model';

const createAccountIntoDB = async (user: JwtPayload, payload: TAccount) => {
  payload.user = user._id;
  const result = await Account.create(payload);
  return result;
};

const getAccountsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const accountQuery = new QueryBuilder(
    Account.find({ user: user._id, isDeleted: false }),
    query,
  )
    .search(AccountSearchableField)
    .filter()
    .sort()
    .limit()
    .paginate()
    .fields();
  const result = await accountQuery.queryModel;
  return result;
};

const getSingleAccountFromDB = async (id: Types.ObjectId, user: JwtPayload) => {
  const result = await Account.isAccountExists(id, user._id);
  return result;
};

const updateAccountIntoDB = async (
  id: Types.ObjectId,
  userId: JwtPayload,
  payload: TAccount,
) => {
  const { user, previousBalance, ...remainingData } = payload;
  const account = await Account.isAccountExists(id, userId._id);
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

const deleteAccountFromDB = async (id: Types.ObjectId, userId: JwtPayload) => {
  const account = await Account.isAccountExists(id, userId._id);
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
