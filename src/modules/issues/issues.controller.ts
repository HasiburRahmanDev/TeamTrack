import type { Request, Response } from "express";
import { issueService } from "./issues.service";
import { sendResponse } from "../../utility/sendResponse";

const createIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.createIssueIntoDB(req.body);
    if (!result) {
      sendResponse(res, 400, "failed to create issue");
    }
    sendResponse(res, 201, "user registered successfully", result.rows[0]);
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};

export const issueController = {
  createIssue,
};
