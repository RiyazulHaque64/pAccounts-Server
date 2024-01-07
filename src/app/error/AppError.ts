/* eslint-disable @typescript-eslint/no-explicit-any */
class AppError extends Error {
  public statusCode: number;
  public error: any;
  constructor(
    statusCode: number,
    message: string,
    error: any = '',
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
