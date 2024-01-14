import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export type TJwtPayload = {
  _id: Types.ObjectId;
  email: string;
  role: string;
};

const createToken = (
  payload: TJwtPayload,
  secret: string,
  expiresIn: string,
) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

export default createToken;
