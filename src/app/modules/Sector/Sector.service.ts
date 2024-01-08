import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { TSector } from './Sector.interface';
import Sector from './Sector.model';

const createSectorIntoDB = async (user: string, payload: TSector) => {
  payload.user = user;
  const result = await Sector.create(payload);
  return result;
};

const updateSectorIntoDB = async (id: string, payload: TSector) => {
  const { user, previousTransaction, transaction, ...remainingData } = payload;
  await Sector.isSectorExists(id);
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cann't update the user!");
  }
  if (
    (transaction && previousTransaction) ||
    transaction ||
    previousTransaction
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cann't update the transaction or previous transaction!",
    );
  }
  const result = await Sector.findByIdAndUpdate(id, remainingData, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteSectorFromDB = async (id: string) => {
  const sector = await Sector.isSectorExists(id);
  const result = await Sector.findByIdAndUpdate(id, {
    previousTransaction: sector?.transaction,
    transaction: 0,
    isDeleted: true,
  });
  return result;
};

export const SectorServices = {
  createSectorIntoDB,
  deleteSectorFromDB,
  updateSectorIntoDB,
};
