import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../error/AppError';
import { TAccount } from '../Account/Account.interface';
import Account from '../Account/Account.model';
import { TSector } from '../Sector/Sector.interface';
import Sector from '../Sector/Sector.model';
import { TTransaction } from './Transaction.interface';
import Transaction from './Transaction.model';

const createTransactionIntoDB = async (user: string, payload: TTransaction) => {
  payload.user = user;
  const sector = await Sector.isSectorExists(payload?.sector);
  const account = await Account.isAccountExists(payload?.account);
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    if (account) {
      if (sector?.sectorType === 'expense') {
        if (account.balance > payload.amount) {
          const updateAccount = await Account.findByIdAndUpdate(
            account?._id,
            {
              balance: account?.balance - payload.amount,
              previousBalance: account?.balance,
            },
            { new: true, runValidators: true, session },
          );
          if (!updateAccount) {
            throw new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              'Failed to complete transaction!',
            );
          }
        } else {
          throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance!');
        }
      } else if (sector?.sectorType === 'income') {
        const updateAccount = await Account.findByIdAndUpdate(
          account?._id,
          {
            balance: account?.balance + payload.amount,
            previousBalance: account?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
      }
    }
    if (sector) {
      const updateSector = await Sector.findByIdAndUpdate(
        sector?._id,
        {
          transaction: sector?.transaction + payload.amount,
          previousTransaction: sector?.transaction,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateSector) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to complete transaction!',
        );
      }
    }
    if (sector?.parent !== 'parent') {
      const parentSector = await Sector.isSectorExists(
        sector?.parent as Types.ObjectId,
      );
      if (parentSector) {
        const updateParentSector = await Sector.findByIdAndUpdate(
          parentSector._id,
          {
            transaction: parentSector.transaction + payload.amount,
            previousTransaction: parentSector?.transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateParentSector) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
      }
    }
    const result = await Transaction.create(payload);
    await session.commitTransaction();
    await session.endSession();
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error?.message || 'Failed to complete transaction!',
    );
  }
};

const getSingleTransactionFromDB = async (id: Types.ObjectId) => {
  const result = await Transaction.isTransactionExists(id);
  return result;
};

const deleteTransactionFromDB = async (id: Types.ObjectId) => {
  const transaction = (await Transaction.isTransactionExists(
    id,
  )) as TTransaction;

  const sector = transaction.sector as unknown as TSector;
  const account = transaction.account as unknown as TAccount;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    if (sector.sectorType === 'income') {
      const updateAccount = await Account.findByIdAndUpdate(
        account?._id,
        {
          balance: account?.balance - transaction.amount,
          previousBalance: account?.balance,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateAccount) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to delete transaction!',
        );
      }
    } else if (sector.sectorType === 'expense') {
      const updateAccount = await Account.findByIdAndUpdate(
        account?._id,
        {
          balance: account?.balance + transaction.amount,
          previousBalance: account?.balance,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateAccount) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to delete transaction!',
        );
      }
    }

    const updateSector = await Sector.findByIdAndUpdate(
      sector?._id,
      {
        transaction: sector?.transaction - transaction.amount,
        previousTransaction: sector?.transaction,
      },
      { new: true, runValidators: true, session },
    );
    if (!updateSector) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete transaction!',
      );
    }

    if (sector.parent !== 'parent') {
      const parentSector = await Sector.findById(sector.parent).select(
        'transaction _id',
      );
      console.log(parentSector);
      if (parentSector) {
        const updateParentSector = await Sector.findByIdAndUpdate(
          parentSector._id,
          {
            transaction: parentSector.transaction - transaction.amount,
            previousTransaction: parentSector.transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateParentSector) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to delete transaction!',
          );
        }
      }
    }
    const result = await Transaction.findByIdAndDelete(id);
    await session.commitTransaction();
    await session.endSession();
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error?.message || 'Failed to delete transaction!',
    );
  }
};

export const TransactionServices = {
  createTransactionIntoDB,
  deleteTransactionFromDB,
  getSingleTransactionFromDB,
};
