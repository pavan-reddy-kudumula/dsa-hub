import pool from "../config/db.js";

import { toNumberOrUndefined } from "../lib/validation.js";

export async function getBookmarks(req, res, next) {
  try {
    const cleanUserId = toNumberOrUndefined(req?.user.id);

    if (!Number.isInteger(cleanUserId) || cleanUserId < 1) {
      const err = new Error("User ID must be a valid positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const { rows: bookmarks } = await pool.query("SELECT b.question_id, q.title, q.difficulty FROM bookmarks AS b INNER JOIN questions AS q ON b.question_id = q.id WHERE b.user_id = $1", [cleanUserId]);

    return res.status(200).json({ bookmarks, message: "Bookmarks fetched successfully." });
    
  } catch(err) {
    next(err);
  }
}

export async function createBookmark(req, res, next) {
  try {
    const cleanUserId = toNumberOrUndefined(req?.user.id);
    const cleanQuestionId = toNumberOrUndefined(req?.body.questionId);

    if (!Number.isInteger(cleanUserId) || cleanUserId < 1) {
      const err = new Error("User ID must be a valid positive integer.");
      err.statusCode = 400;
      throw err;
    }

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a valid positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const { rows: bookmark } = await pool.query("INSERT INTO bookmarks (user_id, question_id) VALUES ($1, $2) RETURNING id, user_id, question_id", [cleanUserId, cleanQuestionId]);
    
    return res.status(201).json({ bookmark: bookmark[0], message: "Bookmark created successfully." });
  } catch (err) {
    if (err.code === '23505' && err.constraint === "bookmarks_uniq_user_id_question_id") {
      err.message = "Bookmark already exists for this question.";
      err.statusCode = 409;
    }
    if (err.code === "23503" && err.constraint === "bookmarks_question_id_fkey") {
      err.message = "Question ID does not exist.";
      err.statusCode = 404;
    }
    if (err.code === "23503" && err.constraint === "bookmarks_user_id_fkey") {
      err.message = "User ID does not exist.";
      err.statusCode = 404;
    }
    next(err);
  }
}

export async function deleteBookmark(req, res, next) {
  try {
    const cleanUserId = toNumberOrUndefined(req?.user.id);
    const cleanQuestionId = toNumberOrUndefined(req?.params.questionId);

    if (!Number.isInteger(cleanUserId) || cleanUserId < 1) {
      const err = new Error("User ID must be a valid positive integer.");
      err.statusCode = 400;
      throw err;
    }

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a valid positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const { rows: bookmark } = await pool.query("DELETE FROM bookmarks WHERE user_id = $1 AND question_id = $2 RETURNING id, user_id, question_id", [cleanUserId, cleanQuestionId]);

    if (bookmark.length === 0) {
      const err = new Error("Bookmark does not exist.");
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json({ bookmark: bookmark[0], message: "Bookmark deleted successfully." });
  } catch(err) {
    next(err);
  }
}