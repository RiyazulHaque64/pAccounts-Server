import express, { Application } from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler';

const app: Application = express();

// server root api
app.use('/', (req, res) => {
  res.status(httpStatus.OK).json({
    success: false,
    message: 'pAccounts server is working fine',
  });
});

// global error handler middleware
app.use(globalErrorHandler);

export default app;
