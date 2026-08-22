import pool from "../config/db.js";
import { statusEnum } from "../constants/enums.js";

const toNumberOrUndefined = (value) => (value !== undefined) ? Number(value) : undefined;
const statusMap = { "not_attempted": 1, "in_progress": 2, "attempted": 3, "solved": 4 };

export async function getUserQuestions(req, res, next) {
  try {
    const cleanUserId = toNumberOrUndefined(req?.user.id);

    if (!Number.isInteger(cleanUserId) || cleanUserId < 1) {
      const err = new Error("User ID must be a valid positive integer.")
      err.statusCode = 400;
      throw err;
    }

    const { rows: userQuestions } = await pool.query("SELECT user_id, question_id, status, attempts, solved_at, created_at, updated_at FROM user_questions WHERE user_id = $1", [cleanUserId]);

    return res.status(200).json({ userQuestions, message: "userQuestions fetched successfully." });
  } catch (err) {
      next(err);
  }
}

export async function getUserQuestion(req, res, next) {
  try {
    const cleanUserId = toNumberOrUndefined(req?.user.id);
    const cleanQuestionId = toNumberOrUndefined(req?.params.questionId);

    if (!Number.isInteger(cleanUserId) || cleanUserId < 1) {
      const err = new Error("User ID must be a valid positive integer.")
      err.statusCode = 400;
      throw err;
    }

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a valid positive integer.")
      err.statusCode = 400;
      throw err;
    }

    const { rows: userQuestion } = await pool.query("SELECT user_id, question_id, status, attempts, solved_at, created_at, updated_at FROM user_questions WHERE user_id = $1 AND question_id = $2", [cleanUserId, cleanQuestionId]);

    return res.status(200).json({ userQuestion, message: "userQuestion fetched successfully." });
  } catch (err) {
      next(err);
  }
}

export async function updateUserQuestion(req, res, next) {
  let client;
  let transactionBegin = false;
  try {
    const cleanUserId = toNumberOrUndefined(req?.user.id);
    const cleanQuestionId = toNumberOrUndefined(req?.params.questionId);

    if (!Number.isInteger(cleanUserId) || cleanUserId < 1) {
      const err = new Error("User ID must be a valid positive integer.")
      err.statusCode = 400;
      throw err;
    }
    
    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a valid positive integer.")
      err.statusCode = 400;
      throw err;
    }

    const { status } = req?.body;

    let cleanStatus = (typeof status === "string" && status.trim() !== "") ? status.trim().toLowerCase() : undefined;

    let query = [];
    let values = [];
    let index = 1;

    if (status !== undefined) {
      if (!statusEnum.includes(cleanStatus)) {
        const err = new Error("Status must be in not_attempted, in_progress, solved, and attempted.")
        err.statusCode = 400;
        throw err;
      }

      query.push(`status = $${index++}`);
      values.push(cleanStatus);
    }

    if (cleanStatus === "attempted" || cleanStatus === "solved") {
      query.push(`attempts = attempts + 1`);
    }

    if (query.length === 0) {
      const err = new Error("No fields to update.");
      err.statusCode = 400;
      throw err;
    }

    client = await pool.connect();
    await client.query("BEGIN");
    transactionBegin = true;
    
    const { rows: userQuestion } = await client.query("SELECT status FROM user_questions WHERE user_id = $1 AND question_id = $2 FOR UPDATE", [cleanUserId, cleanQuestionId]);
    
    if (userQuestion.length === 0) {
      const err = new Error("Question does not exist.");
      err.statusCode = 404;
      throw err;
    }
    
    if (statusMap[cleanStatus] < statusMap[userQuestion[0].status]) {
      const err = new Error("Status cannot be reduced.");
      err.statusCode = 400;
      throw err;
    }

    if (cleanStatus === "solved") {
      query.push(`solved_at = COALESCE(solved_at, NOW())`);
    } 

    values.push(cleanUserId, cleanQuestionId);

    const { rows } = await client.query(`UPDATE user_questions SET ${query.join(" ,")} WHERE user_id = $${index++} AND question_id = $${index} RETURNING user_id, question_id, status, attempts, solved_at, created_at, updated_at`, values);

    await client.query("COMMIT");
    transactionBegin = false;

    return res.status(200).json({ updatedUserQuestion: rows[0], message: "User Question updated successfully." });
  } catch (err) {
    if (client && transactionBegin) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.log("Rollback Error in updateUserQuestion controller:", rollbackErr);
      }
    }
      next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
}