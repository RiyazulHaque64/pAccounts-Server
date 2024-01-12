import httpStatus from 'http-status';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { sectorSearchableField } from './Sector.const';
import { TSector } from './Sector.interface';
import Sector from './Sector.model';

const createSectorIntoDB = async (user: string, payload: TSector) => {
  payload.user = user;
  const result = await Sector.create(payload);
  return result;
};

const getSectorsFromDB = async (
  user: string,
  query: Record<string, unknown>,
) => {
  const accountQuery = new QueryBuilder(
    Sector.find({ user, isDeleted: false }),
    query,
  )
    .search(sectorSearchableField)
    .filter()
    .sort()
    .limit()
    .paginate()
    .fields();
  const result = await accountQuery.queryModel;
  return result;
};

const getSingleSectorFromDB = async (id: Types.ObjectId) => {
  const result = await Sector.isSectorExists(id);
  return result;
};

const updateSectorIntoDB = async (id: Types.ObjectId, payload: TSector) => {
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

const deleteSectorFromDB = async (id: Types.ObjectId) => {
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
  getSectorsFromDB,
  getSingleSectorFromDB,
};
