import { Router } from "express";
import { issueController } from "./issues.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

router.post(
  "/",
  auth("USER_ROLE.contributor", USER_ROLE.maintainer),
  issueController.createIssue,
);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);

export const issueRoute = router;
