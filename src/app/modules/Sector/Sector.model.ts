import { Schema, model } from 'mongoose';
import { SectorMethod, TSector } from './Sector.interface';
import { SectorType } from './Sector.const';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

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
      type: String,
      default: 'parent',
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
  },
  { timestamps: true },
);

// Account existence verification
sectorSchema.statics.isSectorExists = async function (id: string) {
  const checkSector = await Sector.findById(id);
  if (checkSector?.isDeleted === true || !checkSector) {
    throw new AppError(httpStatus.NOT_FOUND, "Sector doesn't exists!");
  }
  return checkSector;
};

const Sector = model<TSector, SectorMethod>('Sector', sectorSchema);

export default Sector;
