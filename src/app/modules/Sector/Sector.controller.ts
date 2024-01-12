import httpStatus from 'http-status';
import { Types } from 'mongoose';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SectorServices } from './Sector.service';

const createSector = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await SectorServices.createSectorIntoDB(
    'riyazulhaque64@gmail.com',
    data,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Sector is created successfully',
    data: result,
  });
});

const getSectors = catchAsync(async (req, res) => {
  const result = await SectorServices.getSectorsFromDB(
    'riyazulhaque64@gmail.com',
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sectors are retrieved successfully',
    data: result,
  });
});

const getSingleSector = catchAsync(async (req, res) => {
  const result = await SectorServices.getSingleSectorFromDB(
    new Types.ObjectId(req.params.id),
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sector is retrieved successfully',
    data: result,
  });
});

const updateSector = catchAsync(async (req, res) => {
  const result = await SectorServices.updateSectorIntoDB(
    new Types.ObjectId(req.params.id),
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sector is updated successfully',
    data: result,
  });
});

const deleteSector = catchAsync(async (req, res) => {
  await SectorServices.deleteSectorFromDB(new Types.ObjectId(req.params?.id));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sector is deleted successfully',
    data: null,
  });
});

export const SectorControllers = {
  createSector,
  deleteSector,
  updateSector,
  getSectors,
  getSingleSector,
};
