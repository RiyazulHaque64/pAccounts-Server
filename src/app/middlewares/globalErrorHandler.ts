import { ErrorRequestHandler } from 'express';
import httpStatus from 'http-status';
import { TErrorSource } from '../interface/error';
import config from '../config';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const statusCode = error?.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = error?.message || 'Something went wrong!';
  const errorSources: TErrorSource[] = [
    {
      path: '',
      message: error?.message || '',
    },
  ];

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.node_env === 'development' ? error?.stack : null,
  });
};

export default globalErrorHandler;
