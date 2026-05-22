import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utility/sendResponse";

const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUserIntoDB(req.body);

    if (!result) {
      sendResponse(res, 400, "failed to create user");
    }
    sendResponse(res, 201, "user registered successfully", result.rows[0]);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken } = result;
    res.cookie("refreshToken", refreshToken, {
      secure: false, // in production -> true
      httpOnly: true,
      sameSite: "lax",
    });
    sendResponse(res, 200, "Login successful", result);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const authController = {
  registerUser,
  loginUser,
};
