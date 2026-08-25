import pool from "../config/db.js";
import { createError } from "../lib/createError.js";
import { isValidInteger, isValidString, toNumberOrUndefined } from "../lib/validation.js";

export async function getCompanies(req, res, next) {
  try {
    const { rows: companies } = await pool.query('SELECT id, name FROM companies ORDER BY name');

    return res.status(200).json({ companies, message: "Companies fetched successfully." });
  } catch (err) {
    next(err);
  }
}

export async function getCompany(req, res, next) {
  try {
    const cleanId = toNumberOrUndefined(req?.params?.id);

    if (!isValidInteger(cleanId)) {
      throw createError("ID must be a valid positive integer.", 400);
    }
    
    const { rows } = await pool.query('SELECT id, name FROM companies WHERE id = $1', [cleanId]);

    if (rows.length === 0) {
      throw createError("Company not found.", 404);
    }
    
    return res.status(200).json({ company: rows[0], message: "Company fetched successfully." });
  } catch (err) {
    next(err);
  }
}

export async function createCompany(req, res, next) {
  try {
    const name = req?.body?.name;
    const cleanName = isValidString(name) ? name.trim().toLowerCase() : undefined;
       
    if (cleanName === undefined) {
      throw createError("Name must be valid string.", 400);
    }

    const { rows } = await pool.query("INSERT INTO companies (name) VALUES ($1) RETURNING id, name", [cleanName]);

    return res.status(201).json({ company: rows[0], message: "Company created successfully." });
  } catch (err) {

    if (err.code === "23505" && err.constraint === "companies_name_key") {
      err.message = "Name already exists.";
      err.statusCode = 409;
    }
    
    next(err);
  }
}

export async function updateCompany(req, res, next) {
  try {
    const cleanId = toNumberOrUndefined(req?.params?.id);

    if (!isValidInteger(cleanId)) {
      throw createError("ID must be a valid positive integer.", 400);
    }

    const name = req?.body?.name;
    const cleanName = isValidString(name) ? name.trim().toLowerCase() : undefined;
       
    if (cleanName === undefined) {
      throw createError("Name must be valid string.", 400);
    }

    const { rows } = await pool.query("UPDATE companies SET name = $1 WHERE id = $2 RETURNING id, name", [cleanName, cleanId]);

    if (rows.length === 0) {
      throw createError("Company not found.", 404);
    }

    return res.status(200).json({ updatedCompany: rows[0], message: "Company updated successfully." });
  } catch (err) {

    if (err.code === "23505" && err.constraint === "companies_name_key") {
      err.message = "Name already exists.";
      err.statusCode = 409;
    }
    
    next(err);
  }
}

export async function deleteCompany(req, res, next) {
  try {
    const cleanId = toNumberOrUndefined(req?.params?.id);

    if (!isValidInteger(cleanId)) {
      throw createError("ID must be a valid positive integer.", 400);
    }

    const { rows } = await pool.query("DELETE FROM companies WHERE id = $1 RETURNING id, name", [cleanId]);

    if (rows.length === 0) {
      throw createError("Company not found.", 404);
    }

    return res.status(200).json({ deletedCompany: rows[0], message: "Company deleted successfully." });
  } catch (err) {
    next(err);
  }
}