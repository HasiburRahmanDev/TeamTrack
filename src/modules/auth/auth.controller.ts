import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utility/sendResponse";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUserIntoDB(req.body);

    if (!result) {
      sendResponse(res, 400, "failed to create user");
    }
    sendResponse(res, 200, "user registered successfully", result.rows[0]);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const authController = {
  createUser,
};
