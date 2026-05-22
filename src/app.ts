import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import logger from "./middleware/logger";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { authRoute } from "./modules/auth/auth.route";
import CookieParser from "cookie-parser";
import cors from "cors";
import { issueRoute } from "./modules/issues/issues.route";

const app: Application = express();
app.use(CookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(cors());
app.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;
