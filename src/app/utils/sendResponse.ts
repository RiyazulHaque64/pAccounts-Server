import { Response } from 'express';

type TResult<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
};
const sendResponse = <T>(res: Response, result: TResult<T>) => {
  const { statusCode, success, message, data } = result;
  res.status(statusCode).json({
    success,
    message,
    data,
  });
};

export default sendResponse;
