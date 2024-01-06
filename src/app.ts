import express, { Application } from 'express';
import httpStatus from 'http-status';

const app: Application = express();

// server root api
app.use('/', (req, res) => {
  res.status(httpStatus.OK).json({
    success: false,
    message: 'pAccounts server is working fine',
  });
});

export default app;
