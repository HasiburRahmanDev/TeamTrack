import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
          INSERT INTO users(email, name, password, role) VALUES($1,$2, $3, COALESCE($4, 'contributor')) 
          RETURNING * `,
    [email, name, hashPassword, role],
  );

  delete result.rows[0].password;
  return result;
};

const loginUserIntoDB = async (payload: IUser) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email],
  );
  if (userData.rows.length === 0) {
    throw new Error("invalid credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("invalid email or password");
  }
  // generate token
  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
  };
  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(jwtPayload, config.refresh_secret as string, {
    expiresIn: "1d",
  });
  delete user.password;
  return { accessToken, refreshToken, user };
};

export const authService = {
  createUserIntoDB,
  loginUserIntoDB,
};
