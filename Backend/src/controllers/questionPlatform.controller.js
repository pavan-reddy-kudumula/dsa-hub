import pool from "../config/db.js";
import { platformEnum } from "../constants/enums.js";

const toNumberOrUndefined = (value) => value !== undefined ? Number(value) : undefined;
const isValidString = (value) => (typeof value === "string" && value.trim() !== "") ? true : false;

export async function getQuestionPlatforms(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be valid positive integer.");
      err.statusCode = 400;
      throw err;
    }
    
    const { rows: questionPlatforms } = await pool.query("SELECT id, question_id, platform, link, created_at, updated_at FROM question_platform_links WHERE question_id = $1 ORDER BY id", [cleanQuestionId]);

    return res.status(200).json({questionPlatforms, message: "Question platforms fetched successfully."})
  } catch(err) {
    next(err);
  }
}

export async function createQuestionPlatform(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);
    
    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be valid positive integer.");
      err.statusCode = 400;
      throw err;
    }
    
    const { platform, link } = req.body || {};

    const cleanPlatform = isValidString(platform) ? platform.trim().toLowerCase() : undefined;
    const cleanLink = isValidString(link) ? link.trim() : undefined;

    if (!platformEnum.includes(cleanPlatform)) {
      const err = new Error("Platform name must be in leetcode, geeksforgeeks, hackerrank, codechef and codingninjas.");
      err.statusCode = 400;
      throw err;
    }

    if (cleanLink === undefined) {
      const err = new Error("Link must be a non-empty string.");
      err.statusCode = 400;
      throw err;
    }

    const { rows } = await pool.query("INSERT INTO question_platform_links (question_id, platform, link) VALUES ($1, $2, $3) RETURNING id, question_id, platform, link, created_at, updated_at", [cleanQuestionId, cleanPlatform, cleanLink]);

    return res.status(201).json({ questionPlatform: rows[0], message: "Question Platform created successfully." });
  } catch (err) {
    if (err.code === "23505" && err.constraint === "question_platform_links_uniq_question_id_platform") {
      err.message = "Platform already exists.";
      err.statusCode = 409;
    }
    next(err);
  }
}

export async function updateQuestionPlatform(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);
    
    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be valid positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const platform = req.params?.platform;
    const link = req.body?.link;
    
    const cleanPlatform = isValidString(platform) ? platform.trim().toLowerCase() : undefined;
    const cleanLink = isValidString(link) ? link.trim() : undefined;

    if (!platformEnum.includes(cleanPlatform)) {
      const err = new Error("Platform name must be in leetcode, geeksforgeeks, hackerrank, codechef and codingninjas.");
      err.statusCode = 400;
      throw err;
    }

    if (cleanLink === undefined) {
      const err = new Error("Link must be a non-empty string.");
      err.statusCode = 400;
      throw err;
    }

    const { rows } = await pool.query("UPDATE question_platform_links SET link = $1 WHERE question_id = $2 AND platform = $3 RETURNING id, question_id, platform, link, created_at, updated_at", [cleanLink, cleanQuestionId, cleanPlatform]);

    if (rows.length === 0) {
      const err = new Error("Question platform not found.");
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json({ questionPlatform: rows[0], message: "Question Platform updated successfully." });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuestionPlatform(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);
    
    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be valid positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const platform = req.params?.platform;
    
    const cleanPlatform = isValidString(platform) ? platform.trim().toLowerCase() : undefined;

    if (!platformEnum.includes(cleanPlatform)) {
      const err = new Error("Platform name must be in leetcode, geeksforgeeks, hackerrank, codechef and codingninjas.");
      err.statusCode = 400;
      throw err;
    }

    const { rows } = await pool.query("DELETE FROM question_platform_links WHERE question_id = $1 AND platform = $2 RETURNING id, question_id, platform, link", [cleanQuestionId, cleanPlatform]);

    if (rows.length === 0) {
      const err = new Error("Question platform not found.");
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json({ questionPlatform: rows[0], message: "Question Platform deleted successfully." });
  } catch(err) {
    next(err);
  }
}