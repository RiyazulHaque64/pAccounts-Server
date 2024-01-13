import { ErrorRequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../config';
import duplicateErrorHandler from '../error/duplicateErrorHandler';
import mongooseErrorHandler from '../error/mongooseErrorHandler';
import zodErrorHandler from '../error/zodErrorHandler';
import { TErrorSource } from '../interface/error';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = error?.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = error?.message || 'Something went wrong!';
  let errorSources: TErrorSource[] = [
    {
      path: '',
      message: error?.message || '',
    },
  ];

  // handle various type of error
  if (error?.name === 'ValidationError') {
    const simplifiedError = mongooseErrorHandler(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error?.name === 'ZodError') {
    const simplifiedError = zodErrorHandler(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error?.code === 11000) {
    const simplifiedError = duplicateErrorHandler(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.node_env === 'development' ? error?.stack : null,
    error,
  });
};

export default globalErrorHandler;
