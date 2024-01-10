import httpStatus from 'http-status';
import { Schema, Types, model } from 'mongoose';
import AppError from '../../error/AppError';
import { AccountType } from './Account.constant';
import { AccountMethod, TAccount } from './Account.interface';

const accountSchema = new Schema<TAccount, AccountMethod>(
  {
    user: {
      type: String,
      required: [true, 'User email is required!'],
    },
    accountName: {
      type: String,
      required: [true, 'Account name is must be required!'],
    },
    accountType: {
      type: String,
      enum: AccountType,
      required: [true, 'Account type is required!'],
    },
    balance: {
      type: Number,
      min: 0,
      default: 0,
    },
    previousBalance: {
      type: Number,
      default: 0,
      select: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: 0,
    },
  },
  { timestamps: true },
);

// Account existence verification
accountSchema.statics.isAccountExists = async function (id: Types.ObjectId) {
  const checkAccount = await Account.findOne({ _id: id, isDeleted: false });
  if (!checkAccount) {
    throw new AppError(httpStatus.NOT_FOUND, "Account doesn't exists!");
  }
  return checkAccount;
};

const Account = model<TAccount, AccountMethod>('Account', accountSchema);

export default Account;
