import type { Response } from "express";

interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  errors?: string | string[];
  stack?: string;
}

export const sendResponse = <T>(
  res: Response,
  payload: IApiResponse<T>,
): void => {
  res.status(payload.statusCode).json({
    success: payload.success,
    message: payload.message,
    data: payload.data,
    errors: payload.errors,
    stack: payload.stack,
  });
};
