import { Schema, model } from 'mongoose';
import { TTransactor } from './Transactor.interface';

const transactorSchema = new Schema<TTransactor>({
  user: {
    type: String,
    required: [true, 'User email is required!'],
  },
  transactorName: {
    type: String,
    required: [true, 'Transactor name is required!'],
  },
  reference: String,
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required!'],
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
  },
});

const Transactor = model<TTransactor>('Transactor', transactorSchema);
export default Transactor;
