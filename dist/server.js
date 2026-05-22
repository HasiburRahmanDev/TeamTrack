
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
Method -> ${req.method}, URL -> ${req.url}, Time -> ${Date.now()} ${req.hostname}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/config/index.ts
import dotenv from "dotenv";
import { env } from "process";
dotenv.config({ quiet: true });
var config = {
  port: env.PORT,
  database_url: env.DATABASE_URL,
  node_env: env.NODE_ENV,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  access_token_expire: process.env.ACCESS_TOKEN_EXPIRITY
};
var config_default = config;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal server error",
    stack: config_default.node_env === "production" ? err.stack : void 0
  });
};

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({ connectionString: config_default.database_url });
var initDB = async () => {
  try {
    await pool.query(`
  CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(75) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'contributor',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
 `);
    await pool.query(`
  CREATE TABLE IF NOT EXISTS issues(
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL, 
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, 
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
 `);
  } catch (error) {
  }
  console.log("Database connected successfully");
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
          INSERT INTO users(email, name, password, role) VALUES($1,$2, $3, COALESCE($4, 'contributor')) 
          RETURNING * `,
    [email, name, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("invalid credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("invalid email or password");
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_active: user.is_active
  };
  const accessToken = jwt.sign(jwtPayload, config_default.secret, {
    expiresIn: "1d"
  });
  const refreshToken = jwt.sign(jwtPayload, config_default.refresh_secret, {
    expiresIn: "1d"
  });
  delete user.password;
  return { accessToken, refreshToken, user };
};
var authService = {
  createUserIntoDB,
  loginUserIntoDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data
  });
};

// src/modules/auth/auth.controller.ts
var registerUser = async (req, res) => {
  try {
    const result = await authService.createUserIntoDB(req.body);
    if (!result) {
      sendResponse(res, 400, "failed to create user");
    }
    sendResponse(res, 201, "user registered successfully", result.rows[0]);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken } = result;
    res.cookie("refreshToken", refreshToken, {
      secure: false,
      // in production -> true
      httpOnly: true,
      sameSite: "lax"
    });
    sendResponse(res, 200, "Login successful", result);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};
var authController = {
  registerUser,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.registerUser);
router.post("/login", authController.loginUser);
var authRoute = router;

// src/app.ts
import CookieParser from "cookie-parser";
import cors from "cors";

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      sendResponse(res, 401, "Unauthorized access");
    }
    const decoded = jwt2.verify(
      token,
      config_default.secret
    );
    const userData = await pool.query(
      `
        SELECT * FROM users WHERE email=$1
        `,
      [decoded.email]
    );
    const user = userData.rows[0];
    if (userData.rows.length === 0) {
      sendResponse(res, 404, "user not found");
    }
    if (roles.length && !roles.includes(user.role)) {
      sendResponse(res, 403, "forbidden!!");
    }
    req.user = decoded;
    next();
  };
};
var auth_default = auth;

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const user = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [reporter_id]
  );
  if (user.rows.length === 0) {
    throw new Error("User is not exist");
  }
  const result = await pool.query(
    `INSERT INTO issues (title, description, type, status, reporter_id)
       VALUES ($1, $2, $3, 'open', $4)
       RETURNING *`,
    [title, description, type, reporter_id]
  );
  return result;
};
var getAllIssueFromDB = async () => {
  const result = await pool.query(`
          SELECT * FROM issues
          `);
  return result;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1
      `,
    [id]
  );
  return result;
};
var updateIssueIntoDB = async (payload, id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        UPDATE issues SET 
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          type = COALESCE($3, type)
        WHERE id = $4
        RETURNING *
        `,
    [title, description, type, id]
  );
  return result;
};
var deleteIssueInDB = async (id) => {
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id=$1 

        `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueInDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const reporter_id = req.user?.id;
    const result = await issueService.createIssueIntoDB({
      ...req.body,
      reporter_id
    });
    if (!result) {
      sendResponse(res, 400, "failed to create issue");
    }
    sendResponse(res, 201, "user registered successfully", result.rows[0]);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};
var getAllIssues = async (req, res) => {
  const result = await issueService.getAllIssueFromDB();
  sendResponse(res, 200, "issue retrieved successfully", result.rows);
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  const result = await issueService.getSingleIssueFromDB(id);
  if (result.rows.length === 0) {
    res.status(404).json({
      success: false,
      message: "issue not found",
      data: {}
    });
  }
  sendResponse(res, 200, "issue retrieved successfully", result.rows[0]);
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  const result = await issueService.updateIssueIntoDB(req.body, id);
  if (result.rows.length === 0) {
    return sendResponse(res, 404, "issue not found");
  }
  sendResponse(res, 200, "issue updated successfully", result.rows[0]);
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  const result = await issueService.deleteIssueInDB(id);
  if (result.rowCount === 0) {
    sendResponse(res, 404, "issue not found");
  }
  sendResponse(res, 200, "deleted successfully");
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post(
  "/",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  issueController.createIssue
);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.put(
  "/:id",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  issueController.updateIssue
);
router2.delete("/:id", auth_default(USER_ROLE.maintainer), issueController.deleteIssue);
var issueRoute = router2;

// src/app.ts
var app = express();
app.use(CookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello");
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var main = async () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`server is running on ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map