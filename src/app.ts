import express, { Application } from 'express';
import httpStatus from 'http-status';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// apply middlewares
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173'] }));

// server root api
app.get('/', (req, res) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'pAccounts server is working fine',
  });
});

// application router
app.use('/api', router);

// global error handler middleware
app.use(globalErrorHandler);
app.use(notFound);

export default app;
