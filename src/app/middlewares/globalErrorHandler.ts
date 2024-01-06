import { ErrorRequestHandler } from 'express';
import httpStatus from 'http-status';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
  });
};

export default globalErrorHandler;
