import httpStatus from 'http-status';
import { Schema, Types, model } from 'mongoose';
import AppError from '../../error/AppError';
import { TTransactor, TransactorMethod } from './Transactor.interface';

const transactorSchema = new Schema<TTransactor, TransactorMethod>(
  {
    user: {
      type: String,
      required: [true, 'User email is required!'],
    },
    transactorName: {
      type: String,
      required: [true, 'Transactor name is required!'],
    },
    reference: {
      type: String,
      default: '',
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required!'],
      unique: true,
    },
    transaction: {
      type: Number,
      default: 0,
    },
    previousTransaction: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: 0,
    },
  },
  { timestamps: true },
);

transactorSchema.statics.isTransactorExists = async function (
  id: Types.ObjectId,
) {
  const transactor = await Transactor.findOne({ _id: id, isDeleted: false });
  if (!transactor) {
    throw new AppError(httpStatus.BAD_REQUEST, "Transactor doesn't exists!");
  }
  return transactor;
};

const Transactor = model<TTransactor, TransactorMethod>(
  'Transactor',
  transactorSchema,
);
export default Transactor;
