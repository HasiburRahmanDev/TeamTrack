import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { logger } from "./middleware/logger";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app: Application = express();

app.use(logger);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

export default app;
