import pool from "../config/db.js";
import { createError } from "../lib/createError.js";
import { isValidInteger, toNumberOrUndefined, isValidArray } from "../lib/validation.js";

export async function getQuestionCompanies(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req?.params?.questionId);

    if (!isValidInteger(cleanQuestionId)) {
      throw createError("Question ID must be a valid positive integer.");
    }

    const { rows: questionCompanies } = await pool.query("SELECT qc.question_id, qc.company_id, c.name, qc.created_at FROM question_companies AS qc INNER JOIN companies AS c ON qc.company_id = c.id WHERE question_id = $1 ORDER BY c.name", [cleanQuestionId]);

    return res.status(200).json({ questionCompanies, message: "Question companies fetched successfully." });
  } catch (err) {
    next(err);
  }
}

export async function createQuestionCompanies(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req?.params?.questionId);
    const companyIds = isValidArray(req?.body?.companyIds);

    if (!isValidInteger(cleanQuestionId)) {
      throw createError("Question ID must be a valid positive integer.");
    }

    const values = [];
    const placeholders = companyIds.map((companyId, index) => {
      values.push(cleanQuestionId, companyId);
      const base = index * 2;
      return `($${base + 1}, $${base + 2})`;
    })

    const { rows: questionCompanies } = await pool.query(`INSERT INTO question_companies (question_id, company_id) VALUES ${placeholders.join(", ")} RETURNING question_id, company_id, created_at`, values);

    res.status(201).json({ questionCompanies, message: "Question Companies created successfully." });
  } catch (err) {
    if (err.code === "23505" && err.constraint === "question_companies_pkey") {
      err.message = "Question ID and Company ID combination must be unique.";
      err.statusCode = 409;
    }
    if (err.code === "23503" && err.constraint === "question_companies_question_id_fkey") {
      err.message = "Question ID does not exist.";
      err.statusCode = 404;
    }
    if (err.code === "23503" && err.constraint === "question_companies_company_id_fkey") {
      err.message = "Company ID does not exist.";
      err.statusCode = 404;
    }
    
    next(err);
  }
}

export async function updateQuestionCompanies(req, res, next) {
  let client;
  let transactionBegin = false;
  try {
    const cleanQuestionId = toNumberOrUndefined(req?.params?.questionId);
    const companyIds = isValidArray(req?.body?.companyIds);

    if (!isValidInteger(cleanQuestionId)) {
      throw createError("Question ID must be a valid positive integer.");
    }

    const values = [];
    const placeholders = companyIds.map((companyId, index) => {
      values.push(cleanQuestionId, companyId);
      const base = index * 2;
      return `($${base + 1}, $${base + 2})`;
    })

    client = await pool.connect();
    await client.query("BEGIN");
    transactionBegin = true;

    await client.query("DELETE FROM question_companies WHERE question_id = $1 RETURNING question_id", [cleanQuestionId]);

    const { rows: updatedQuestionCompanies } = await client.query(`INSERT INTO question_companies (question_id, company_id) VALUES ${placeholders.join(", ")} RETURNING question_id, company_id, created_at`, values);

    await client.query("COMMIT");
    transactionBegin = false;
    
    res.status(200).json({ updatedQuestionCompanies, message: "Question Companies updated successfully." });
  } catch (err) {
    if (client && transactionBegin) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.log("Rollback error in update question companies:", rollbackErr);
      }
    }

    if (err.code === "23505" && err.constraint === "question_companies_pkey") {
      err.message = "Question ID and Company ID combination must be unique.";
      err.statusCode = 409;
    }
    if (err.code === "23503" && err.constraint === "question_companies_question_id_fkey") {
      err.message = "Question ID does not exist.";
      err.statusCode = 404;
    }
    if (err.code === "23503" && err.constraint === "question_companies_company_id_fkey") {
      err.message = "Company ID does not exist.";
      err.statusCode = 404;
    }

    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function deleteQuestionCompanies(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req?.params?.questionId);
    const companyIds = isValidArray(req?.body?.companyIds);

    if (!isValidInteger(cleanQuestionId)) {
      throw createError("Question ID must be a valid positive integer.");
    }

    const { rows: deletedQuestionCompanies } = await pool.query("DELETE FROM question_companies WHERE question_id = $1 AND company_id = ANY($2::int[]) RETURNING question_id, company_id", [cleanQuestionId, companyIds]);

    if (deletedQuestionCompanies.length === 0) {
      throw createError("No matching question companies found.", 404);
    }
    
    return res.status(200).json({ deletedQuestionCompanies, message: "Question companies deleted successfully." })
  } catch (err) {
    
    next(err);
  }
}