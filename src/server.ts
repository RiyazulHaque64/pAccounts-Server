import mongoose from 'mongoose';
import { Server } from 'http';
import app from './app';
import config from './app/config';

let server: Server;
async function main() {
  try {
    await mongoose.connect(config.db_url);
    server = app.listen(config.port, () => {
      console.log(`pAccounts server is running on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
main();

// close the server when unhandled error is detected
process.on('unhandledRejection', () => {
  console.log('Unhandled rejection is detected, shutting down .....');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// close server when uncaught exception is detected
process.on('uncaughtException', () => {
  console.log('Uncaught exception is detected, shutting down .....');
  process.exit(1);
});
