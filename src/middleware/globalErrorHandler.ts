import type { NextFunction, Request, Response } from "express";
import config from "../config";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal server error",
    stack: config.node_env === "development" ? err.stack : undefined,
  });
};
