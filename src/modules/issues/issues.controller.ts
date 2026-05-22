import type { Request, Response } from "express";
import { issueService } from "./issues.service";
import { sendResponse } from "../../utility/sendResponse";
import { authService } from "../auth/auth.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const reporter_id = req.user?.id;
    const result = await issueService.createIssueIntoDB({
      ...req.body,
      reporter_id,
    });
    if (!result) {
      sendResponse(res, 400, "failed to create issue");
    }
    sendResponse(res, 201, "user registered successfully", result.rows[0]);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};
const getAllIssues = async (req: Request, res: Response) => {
  const result = await issueService.getAllIssueFromDB();
  sendResponse(res, 200, "issue retrieved successfully", result.rows);
};

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await issueService.getSingleIssueFromDB(id as string);
  if (result.rows.length === 0) {
    res.status(404).json({
      success: false,
      message: "issue not found",
      data: {},
    });
  }
  sendResponse(res, 200, "issue retrieved successfully", result.rows[0]);
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
};
