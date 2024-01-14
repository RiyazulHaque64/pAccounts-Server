import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: number;
      DATABASE_URL: string;
      JWT_ACCESS_SECRET: string;
      JWT_ACCESS_EXPIRESIN: string;
    }
  }
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}
