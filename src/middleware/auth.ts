import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = (...roles: any) => {
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
    const user = userData.rows[0];

    if (userData.rows.length === 0) {
      sendResponse(res, 404, "user not found");
    }

    if (roles.length && !roles.includes(user.role)) {
      sendResponse(res, 403, "forbidden!!");
    }

    req.user = decoded;
    next();
  };
};

export default auth;
