import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      sendResponse(res, 401, "Unauthorized access");
    }
    const decoded = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;

    const userData = await pool.query(
      `
        SELECT * FROM users WHERE email=$1
        `,
      [decoded.email],
    );

    next();
  };
};

export default auth;
