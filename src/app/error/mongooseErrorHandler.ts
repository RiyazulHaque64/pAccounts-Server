import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { TErrorSource, TGenericErrorResponse } from '../interface/error';

const mongooseErrorHandler = (
  error: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
  const errorSources: TErrorSource[] = Object.values(error.errors).map(
    (err) => ({
      path: err.path,
      message: err.message,
    }),
  );
  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Validation failed!',
    errorSources,
  };
};

export default mongooseErrorHandler;
