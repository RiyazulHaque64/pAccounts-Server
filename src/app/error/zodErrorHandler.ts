import httpStatus from 'http-status';
import { ZodError } from 'zod';
import { TErrorSource } from '../interface/error';

const zodErrorHandler = (error: ZodError) => {
  const errorSources: TErrorSource[] = error?.issues?.map((err) => ({
    path: err.path[1],
    message: err.message,
  }));
  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Validation failed!',
    errorSources,
  };
};

export default zodErrorHandler;
