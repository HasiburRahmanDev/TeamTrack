import type { NextFunction, Request, Response } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toLocaleString}], ${req.method}, ${req.url}`);
  next();
};
