import type { NextFunction, Request, Response } from "express";
import fs from "fs";
const logger = (req: Request, res: Response, next: NextFunction) => {
  // console.log("method -> URL -> Time:", req.method, req.url, Date.now());
  const log = `\nMethod -> ${req.method}, URL -> ${req.url}, Time -> ${Date.now()} ${req.hostname}\n`;
  fs.appendFile("logger.txt", log, (err) => {});
  next();
};

export default logger;
