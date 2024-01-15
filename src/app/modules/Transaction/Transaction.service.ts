import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { TAccount } from '../Account/Account.interface';
import Account from '../Account/Account.model';
import { TSector } from '../Sector/Sector.interface';
import Sector from '../Sector/Sector.model';
import { TTransactor } from '../Transactor/Transactor.interface';
import Transactor from '../Transactor/Transactor.model';
import { TTransaction } from './Transaction.interface';
import Transaction from './Transaction.model';

const createTransactionIntoDB = async (
  user: JwtPayload,
  payload: TTransaction,
) => {
  const {
    transactionType,
    sector,
    transferredAccount,
    transactor,
    amount,
    account,
  } = payload;
  payload.user = user._id;
  const sectorData = await Sector.findOne({ _id: sector, isDeleted: false });
  const transactorData = (await Transactor.findOne({
    _id: transactor,
    isDeleted: false,
  })) as TTransactor;
  const transferredAccountData = await Account.findOne({
    _id: transferredAccount,
    isDeleted: false,
  });
  const selectedAccount = (await Account.isAccountExists(
    account,
    user._id,
  )) as TAccount;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    if (sectorData) {
      if (transactionType === 'income') {
        const updateAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance + amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
      } else if (transactionType === 'expense') {
        if (selectedAccount.balance >= amount) {
          const updateAccount = await Account.findByIdAndUpdate(
            selectedAccount?._id,
            {
              balance: selectedAccount?.balance - amount,
              previousBalance: selectedAccount?.balance,
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
      }
      const updateSector = await Sector.findByIdAndUpdate(
        sectorData._id,
        {
          transaction: sectorData.transaction + amount,
          previousTransaction: sectorData.transaction,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateSector) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to complete transaction!',
        );
      }
      if (sectorData?.parent !== 'parent') {
        const parentSector = await Sector.isSectorExists(
          sectorData?.parent as Types.ObjectId,
          user._id,
        );
        if (parentSector) {
          const updateParentSector = await Sector.findByIdAndUpdate(
            parentSector._id,
            {
              transaction: parentSector.transaction + amount,
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
    }
    if (transferredAccountData) {
      if (selectedAccount.balance >= amount) {
        const updateSelectedAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance - amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateSelectedAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
        const updateTransferredAccount = await Account.findByIdAndUpdate(
          transferredAccountData?._id,
          {
            balance: transferredAccountData?.balance + amount,
            previousBalance: transferredAccountData?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransferredAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
      } else {
        throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance!');
      }
    }
    if (transactorData) {
      if (
        transactionType === 'taken loan' ||
        transactionType === 'return loan' ||
        transactionType === 'taken deposit' ||
        transactionType === 'deposit withdrawal'
      ) {
        const updateTransactor = await Transactor.findByIdAndUpdate(
          transactorData?._id,
          {
            transaction: transactorData.transaction - amount,
            previousBalance: transactorData.transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransactor) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
        const updateSelectedAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance + amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateSelectedAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
      } else if (
        transactionType === 'given loan' ||
        transactionType === 'pay loan' ||
        transactionType === 'return deposit' ||
        transactionType === 'add deposit'
      ) {
        const updateTransactor = await Transactor.findByIdAndUpdate(
          transactorData?._id,
          {
            transaction: transactorData.transaction + amount,
            previousBalance: transactorData.transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransactor) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
        const updateSelectedAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance - amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateSelectedAccount) {
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

const getTransactionsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const transactionQuery = new QueryBuilder(
    Transaction.find({ user: user._id }).populate(
      'user account transferredAccount transactor sector',
    ),
    query,
  );
  const result = await transactionQuery.queryModel;
  return result;
};

const getSingleTransactionFromDB = async (
  id: Types.ObjectId,
  user: JwtPayload,
) => {
  const result = await Transaction.isTransactionExists(id, user._id);
  return result;
};

const updateTransactionIntoDB = async (
  id: Types.ObjectId,
  userData: JwtPayload,
  payload: TTransaction,
) => {
  const {
    transactionType,
    transferredAccount,
    sector,
    transactor,
    account,
    amount,
  } = payload;
  payload.user = userData._id;
  const sectorData = await Sector.findOne({ _id: sector, isDeleted: false });
  const transactorData = (await Transactor.findOne({
    _id: transactor,
    isDeleted: false,
  })) as TTransactor;
  const transferredAccountData = await Account.findOne({
    _id: transferredAccount,
    isDeleted: false,
  });
  const selectedAccount = (await Account.isAccountExists(
    account,
    userData._id,
  )) as TAccount;
  const previousTransaction = (await Transaction.isTransactionExists(
    id,
    userData._id,
  )) as TTransaction;
  const {
    transactionType: prevTransactionType,
    sector: prevSector,
    transactor: prevTransactor,
    transferredAccount: prevTransferredAccount,
    account: prevAccount,
    amount: prevAmount,
  } = previousTransaction;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // update sector, transactor, transferred account, account & amount depend on previous transaction
    if (prevSector) {
      if (prevTransactionType === 'income') {
        const updateAccount = await Account.findByIdAndUpdate(
          prevAccount?._id,
          {
            balance: (prevAccount as unknown as TAccount)?.balance - prevAmount,
            previousBalance: (prevAccount as unknown as TAccount)?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
      } else if (prevTransactionType === 'expense') {
        const updateAccount = await Account.findByIdAndUpdate(
          prevAccount?._id,
          {
            balance: (prevAccount as unknown as TAccount)?.balance + prevAmount,
            previousBalance: (prevAccount as unknown as TAccount)?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
      }
      const updateSector = await Sector.findByIdAndUpdate(
        prevSector._id,
        {
          transaction:
            (prevSector as unknown as TSector).transaction - prevAmount,
          previousTransaction: (prevSector as unknown as TSector).transaction,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateSector) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update transaction!',
        );
      }
      if ((prevSector as unknown as TSector)?.parent !== 'parent') {
        const parentSector = await Sector.isSectorExists(
          (prevSector as unknown as TSector)?.parent as Types.ObjectId,
          userData._id,
        );
        if (parentSector) {
          const updateParentSector = await Sector.findByIdAndUpdate(
            parentSector._id,
            {
              transaction: parentSector.transaction - prevAmount,
              previousTransaction: parentSector?.transaction,
            },
            { new: true, runValidators: true, session },
          );
          if (!updateParentSector) {
            throw new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              'Failed to update transaction!',
            );
          }
        }
      }
    }
    if (prevTransferredAccount) {
      const updateAccount = await Account.findByIdAndUpdate(
        prevAccount?._id,
        {
          balance: (prevAccount as unknown as TAccount)?.balance + prevAmount,
          previousBalance: (prevAccount as unknown as TAccount)?.balance,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateAccount) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update transaction!',
        );
      }
      const updateTransferredAccount = await Account.findByIdAndUpdate(
        prevTransferredAccount?._id,
        {
          balance:
            (prevTransferredAccount as unknown as TAccount)?.balance -
            prevAmount,
          previousBalance: (prevTransferredAccount as unknown as TAccount)
            ?.balance,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateTransferredAccount) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update transaction!',
        );
      }
    }
    if (prevTransactor) {
      if (
        prevTransactionType === 'taken loan' ||
        prevTransactionType === 'return loan' ||
        prevTransactionType === 'taken deposit' ||
        prevTransactionType === 'deposit withdrawal'
      ) {
        const updateTransactor = await Transactor.findByIdAndUpdate(
          prevTransactor?._id,
          {
            transaction:
              (prevTransactor as unknown as TTransactor).transaction +
              prevAmount,
            previousBalance: (prevTransactor as unknown as TTransactor)
              .transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransactor) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
        const updateAccount = await Account.findByIdAndUpdate(
          prevAccount?._id,
          {
            balance: (prevAccount as unknown as TAccount)?.balance - prevAmount,
            previousBalance: (prevAccount as unknown as TAccount)?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
      } else if (
        prevTransactionType === 'given loan' ||
        prevTransactionType === 'pay loan' ||
        prevTransactionType === 'return deposit' ||
        prevTransactionType === 'add deposit'
      ) {
        const updateTransactor = await Transactor.findByIdAndUpdate(
          prevTransactor?._id,
          {
            transaction:
              (prevTransactor as unknown as TTransactor).transaction -
              prevAmount,
            previousBalance: (prevTransactor as unknown as TTransactor)
              .transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransactor) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
        const updateAccount = await Account.findByIdAndUpdate(
          prevAccount?._id,
          {
            balance: (prevAccount as unknown as TAccount)?.balance + prevAmount,
            previousBalance: (prevAccount as unknown as TAccount)?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
      }
    }

    // update sector, transactor, transferred account, account & amount depend on new transaction
    if (sectorData) {
      if (transactionType === 'income') {
        const updateAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance + amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
      } else if (transactionType === 'expense') {
        if (selectedAccount.balance >= amount) {
          const updateAccount = await Account.findByIdAndUpdate(
            selectedAccount?._id,
            {
              balance: selectedAccount?.balance - amount,
              previousBalance: selectedAccount?.balance,
            },
            { new: true, runValidators: true, session },
          );
          if (!updateAccount) {
            throw new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              'Failed to update transaction!',
            );
          }
        } else {
          throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance!');
        }
      }
      const updateSector = await Sector.findByIdAndUpdate(
        sectorData._id,
        {
          transaction: sectorData.transaction + amount,
          previousTransaction: sectorData.transaction,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateSector) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update transaction!',
        );
      }
      if (sectorData?.parent !== 'parent') {
        const parentSector = await Sector.isSectorExists(
          sectorData?.parent as Types.ObjectId,
          userData._id,
        );
        if (parentSector) {
          const updateParentSector = await Sector.findByIdAndUpdate(
            parentSector._id,
            {
              transaction: parentSector.transaction + amount,
              previousTransaction: parentSector?.transaction,
            },
            { new: true, runValidators: true, session },
          );
          if (!updateParentSector) {
            throw new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              'Failed to update transaction!',
            );
          }
        }
      }
    }
    if (transferredAccountData) {
      if (selectedAccount.balance >= amount) {
        const updateSelectedAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance - amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateSelectedAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
        const updateTransferredAccount = await Account.findByIdAndUpdate(
          transferredAccountData?._id,
          {
            balance: transferredAccountData?.balance + amount,
            previousBalance: transferredAccountData?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransferredAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
      } else {
        throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance!');
      }
    }
    if (prevTransactor) {
      if (
        transactionType === 'taken loan' ||
        transactionType === 'return loan' ||
        transactionType === 'taken deposit' ||
        transactionType === 'deposit withdrawal'
      ) {
        const updateTransactor = await Transactor.findByIdAndUpdate(
          prevTransactor?._id,
          {
            transaction: transactorData.transaction - amount,
            previousBalance: transactorData.transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransactor) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
        const updateSelectedAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance + amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateSelectedAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
      } else if (
        transactionType === 'given loan' ||
        transactionType === 'pay loan' ||
        transactionType === 'return deposit' ||
        transactionType === 'add deposit'
      ) {
        const updateTransactor = await Transactor.findByIdAndUpdate(
          prevTransactor?._id,
          {
            transaction: transactorData.transaction + amount,
            previousBalance: transactorData.transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransactor) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
        const updateSelectedAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance - amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateSelectedAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to update transaction!',
          );
        }
      }
    }

    const result = await Transaction.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      session,
    });
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

// const updateTransactionIntoDB = async (
//   id: Types.ObjectId,
//   payload: TTransaction,
// ) => {
//   const { sector, account, amount } = payload;
//   const transaction = (await Transaction.isTransactionExists(
//     id,
//   )) as TTransaction;

//   const {
//     sector: prevSector,
//     account: prevAccount,
//     amount: prevAmount,
//   } = transaction;
//   const prevSectorData = transaction.sector as unknown as TSector;
//   const prevAccountData = transaction.account as unknown as TAccount;
//   const newAccountData = (await Account.isAccountExists(account)) as TAccount;
//   const newSectorData = (await Sector.isSectorExists(sector)) as TSector;
//   const session = await mongoose.startSession();
//   try {
//     session.startTransaction();

//     if (
//       prevSector.equals(sector) &&
//       prevAccount.equals(account) &&
//       amount !== prevAmount
//     ) {
//       const updateSector = await Sector.findByIdAndUpdate(
//         sector,
//         {
//           transaction: prevSectorData.transaction - prevAmount + amount,
//           previousTransaction: prevSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updateSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//       if (prevSectorData.sectorType === 'income') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: prevAccountData.balance - prevAmount + amount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       } else if (prevSectorData.sectorType === 'expense') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: prevAccountData.balance + prevAmount - amount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       }
//     }
//     if (
//       !prevSector.equals(sector) &&
//       prevAccount.equals(account) &&
//       amount === prevAmount
//     ) {
//       const updatePrevSector = await Sector.findByIdAndUpdate(
//         prevSector,
//         {
//           transaction: prevSectorData.transaction - amount,
//           previousTransaction: prevSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updatePrevSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//       const updateNewSector = await Sector.findByIdAndUpdate(
//         sector,
//         {
//           transaction: newSectorData.transaction + amount,
//           previousTransaction: newSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updateNewSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//     }
//     if (
//       prevSector.equals(sector) &&
//       !prevAccount.equals(account) &&
//       amount === prevAmount
//     ) {
//       if (prevSectorData.sectorType === 'income') {
//         const updatePrevAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance - prevAmount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updatePrevAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//         const updateNewAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance + amount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateNewAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       } else if (prevSectorData.sectorType === 'expense') {
//         const updatePrevAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance + prevAmount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updatePrevAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//         const updateNewAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance - amount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateNewAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       }
//     }
//     if (
//       prevSector.equals(sector) &&
//       !prevAccount.equals(account) &&
//       amount !== prevAmount
//     ) {
//       const updateSector = await Sector.findByIdAndUpdate(
//         sector,
//         {
//           transaction: prevSectorData.transaction - prevAmount + amount,
//           previousTransaction: prevSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updateSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//       if (prevSectorData.sectorType === 'income') {
//         const updatePrevAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance - prevAmount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updatePrevAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//         const updateNewAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance + amount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateNewAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       } else if (prevSectorData.sectorType === 'expense') {
//         const updatePrevAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance + prevAmount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updatePrevAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//         const updateNewAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance - amount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateNewAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       }
//     }
//     if (
//       !prevSector.equals(sector) &&
//       !prevAccount.equals(account) &&
//       amount === prevAmount
//     ) {
//       const updatePrevSector = await Sector.findByIdAndUpdate(
//         prevSector,
//         {
//           transaction: prevSectorData.transaction - amount,
//           previousTransaction: prevSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updatePrevSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//       const updateNewSector = await Sector.findByIdAndUpdate(
//         sector,
//         {
//           transaction: newSectorData.transaction + amount,
//           previousTransaction: newSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updateNewSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//       if (prevSectorData.sectorType === 'income') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance - prevAmount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       } else if (prevSectorData.sectorType === 'expense') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance + prevAmount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       }
//       if (newSectorData.sectorType === 'income') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance + amount,
//             previousBalance: newAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       } else if (newSectorData.sectorType === 'expense') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance - amount,
//             previousBalance: newAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       }
//     }
//     if (
//       !prevSector.equals(sector) &&
//       prevAccount.equals(account) &&
//       amount !== prevAmount
//     ) {
//       const updatePrevSector = await Sector.findByIdAndUpdate(
//         prevSector,
//         {
//           transaction: prevSectorData.transaction - prevAmount,
//           previousTransaction: prevSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updatePrevSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//       const updateNewSector = await Sector.findByIdAndUpdate(
//         sector,
//         {
//           transaction: newSectorData.transaction + amount,
//           previousTransaction: newSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updateNewSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//       if (prevSectorData.sectorType === 'income') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance - prevAmount + amount,
//             previousBalance: newAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       } else if (prevSectorData.sectorType === 'expense') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance + prevAmount - amount,
//             previousBalance: newAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       }
//       if (newSectorData.sectorType === 'income') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance - prevAmount + amount,
//             previousBalance: newAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       } else if (newSectorData.sectorType === 'expense') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance + prevAmount - amount,
//             previousBalance: newAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       }
//     }
//     if (
//       !prevSector.equals(sector) &&
//       !prevAccount.equals(account) &&
//       amount !== prevAmount
//     ) {
//       const updatePrevSector = await Sector.findByIdAndUpdate(
//         prevSector,
//         {
//           transaction: prevSectorData.transaction - prevAmount,
//           previousTransaction: prevSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updatePrevSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//       const updateNewSector = await Sector.findByIdAndUpdate(
//         sector,
//         {
//           transaction: newSectorData.transaction + amount,
//           previousTransaction: newSectorData.transaction,
//         },
//         { new: true, runValidators: true, session },
//       );
//       if (!updateNewSector) {
//         new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'Failed to update transaction!',
//         );
//       }
//       if (prevSectorData.sectorType === 'income') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance - prevAmount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       } else if (prevSectorData.sectorType === 'expense') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           prevAccount,
//           {
//             balance: prevAccountData.balance + prevAmount,
//             previousBalance: prevAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       }
//       if (newSectorData.sectorType === 'income') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance + amount,
//             previousBalance: newAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       } else if (newSectorData.sectorType === 'expense') {
//         const updateAccount = await Account.findByIdAndUpdate(
//           account,
//           {
//             balance: newAccountData.balance - amount,
//             previousBalance: newAccountData.balance,
//           },
//           { new: true, runValidators: true, session },
//         );
//         if (!updateAccount) {
//           new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to update transaction!',
//           );
//         }
//       }
//     }

//     const result = await Transaction.findByIdAndUpdate(id, payload, {
//       new: true,
//       runValidators: true,
//       session,
//     });
//     if (!result) {
//       new AppError(
//         httpStatus.INTERNAL_SERVER_ERROR,
//         'Failed to update transaction!',
//       );
//     }
//     await session.commitTransaction();
//     await session.endSession();
//     return result;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     await session.abortTransaction();
//     await session.endSession();
//     new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       error.message || 'Failed to update transaction!',
//     );
//   }
// };

const deleteTransactionFromDB = async (
  id: Types.ObjectId,
  user: JwtPayload,
) => {
  const transaction = (await Transaction.isTransactionExists(
    id,
    user._id,
  )) as TTransaction;

  const {
    transactionType,
    sector,
    transferredAccount,
    transactor,
    amount,
    account,
  } = transaction;

  const sectorData = await Sector.findById(sector);
  const prevTransactor = (await Transactor.findById(transactor)) as TTransactor;
  const transferredAccountData = await Account.findById(transferredAccount);
  const selectedAccount = (await Account.isAccountExists(
    account,
    user._id,
  )) as TAccount;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    if (sectorData) {
      if (transactionType === 'income') {
        const updateAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance - amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to delete transaction!',
          );
        }
      } else if (transactionType === 'expense') {
        const updateAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance + amount,
            previousBalance: selectedAccount?.balance,
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
      const updateSector = await Sector.findByIdAndUpdate(
        sectorData._id,
        {
          transaction: sectorData.transaction - amount,
          previousTransaction: sectorData.transaction,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateSector) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to complete transaction!',
        );
      }
      if (sectorData?.parent !== 'parent') {
        const parentSector = await Sector.isSectorExists(
          sectorData?.parent as Types.ObjectId,
          user._id,
        );
        if (parentSector) {
          const updateParentSector = await Sector.findByIdAndUpdate(
            parentSector._id,
            {
              transaction: parentSector.transaction - amount,
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
    }
    if (transferredAccountData) {
      const updateSelectedAccount = await Account.findByIdAndUpdate(
        selectedAccount?._id,
        {
          balance: selectedAccount?.balance + amount,
          previousBalance: selectedAccount?.balance,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateSelectedAccount) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to complete transaction!',
        );
      }
      const updateFieldAccount = await Account.findByIdAndUpdate(
        selectedAccount?._id,
        {
          balance: transferredAccountData?.balance - amount,
          previousBalance: transferredAccountData?.balance,
        },
        { new: true, runValidators: true, session },
      );
      if (!updateFieldAccount) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to complete transaction!',
        );
      }
    }
    if (prevTransactor) {
      if (
        transactionType === 'return loan' ||
        transactionType === 'taken loan' ||
        transactionType === 'taken deposit' ||
        transactionType === 'deposit withdrawal'
      ) {
        const updateTransactor = await Transactor.findByIdAndUpdate(
          prevTransactor?._id,
          {
            transaction: prevTransactor.transaction + amount,
            previousBalance: prevTransactor.transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransactor) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
        const updateSelectedAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance - amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateSelectedAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
      } else if (
        transactionType === 'given loan' ||
        transactionType === 'pay loan' ||
        transactionType === 'return deposit' ||
        transactionType === 'add deposit'
      ) {
        const updateTransactor = await Transactor.findByIdAndUpdate(
          prevTransactor?._id,
          {
            transaction: prevTransactor.transaction - amount,
            previousBalance: prevTransactor.transaction,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateTransactor) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
          );
        }
        const updateSelectedAccount = await Account.findByIdAndUpdate(
          selectedAccount?._id,
          {
            balance: selectedAccount?.balance + amount,
            previousBalance: selectedAccount?.balance,
          },
          { new: true, runValidators: true, session },
        );
        if (!updateSelectedAccount) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to complete transaction!',
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
      error?.message || 'Failed to complete transaction!',
    );
  }
};

export const TransactionServices = {
  createTransactionIntoDB,
  deleteTransactionFromDB,
  getSingleTransactionFromDB,
  updateTransactionIntoDB,
  getTransactionsFromDB,
};
