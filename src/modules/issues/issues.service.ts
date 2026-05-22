import { pool } from "../../db";
import auth from "../../middleware/auth";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue) => {
  const { title, description, type, reporter_id } = payload;

  const user = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [reporter_id],
  );

  if (user.rows.length === 0) {
    throw new Error("User is not exist");
  }

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, status, reporter_id)
       VALUES ($1, $2, $3, 'open', $4)
       RETURNING *`,
    [title, description, type, reporter_id],
  );
  return result;
};

const getAllIssueFromDB = async () => {
  const result = await pool.query(`
          SELECT * FROM issues
          `);

  return result;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1
      `,
    [id],
  );
  return result;
};

const updateIssueIntoDB = async (payload: any, id: string) => {
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
    [title, description, type, id],
  );
  return result;
};

const deleteIssueInDB = async (id: string) => {
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id=$1 

        `,
    [id],
  );
  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueInDB,
};
