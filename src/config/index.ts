import dotenv from "dotenv";
import { env } from "process";

dotenv.config({ quiet: true });

const config = {
  port: env.PORT as string,
  database_url: env.DATABASE_URL as string,
  node_env: env.NODE_ENV as string,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  access_token_expire: process.env.ACCESS_TOKEN_EXPIRITY,
};

export default config;
