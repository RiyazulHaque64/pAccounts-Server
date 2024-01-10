import httpStatus from 'http-status';
import { Schema, Types, model } from 'mongoose';
import AppError from '../../error/AppError';
import { SectorType } from './Sector.const';
import { SectorMethod, TSector } from './Sector.interface';

const sectorSchema = new Schema<TSector, SectorMethod>(
  {
    user: {
      type: String,
      required: [true, 'User email is reqired'],
    },
    sectorName: {
      type: String,
      required: [true, 'Sector name is reqired'],
    },
    sectorType: {
      type: String,
      enum: SectorType,
      required: [true, 'Sector type is reqired'],
    },
    parent: {
      type: String || Schema.Types.ObjectId,
      default: 'parent',
    },
    transaction: {
      type: Number,
      default: 0,
    },
    previousTransaction: {
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
sectorSchema.statics.isSectorExists = async function (id: Types.ObjectId) {
  const checkSector = await Sector.findOne({ _id: id, isDeleted: false });
  if (!checkSector) {
    throw new AppError(httpStatus.NOT_FOUND, "Sector doesn't exists!");
  }
  return checkSector;
};

const Sector = model<TSector, SectorMethod>('Sector', sectorSchema);

export default Sector;
