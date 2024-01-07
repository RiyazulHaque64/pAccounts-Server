import { Schema, model } from 'mongoose';
import { AccountMethod, TAccount } from './Account.interface';
import { AccountType } from './Account.constant';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';

const accountSchema = new Schema<TAccount, AccountMethod>(
  {
    user: {
      type: String,
      required: [true, 'User email is required!'],
    },
    name: {
      type: String,
      required: [true, 'Account name is must be required!'],
    },
    type: {
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
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Account existence verification
accountSchema.statics.isAccountExists = async function (id: string) {
  const checkAccount = await Account.findById(id);
  if (checkAccount?.isDeleted === true || !checkAccount) {
    throw new AppError(httpStatus.NOT_FOUND, "Account doesn't exists!");
  }
  return checkAccount;
};

const Account = model<TAccount, AccountMethod>('Account', accountSchema);

export default Account;
