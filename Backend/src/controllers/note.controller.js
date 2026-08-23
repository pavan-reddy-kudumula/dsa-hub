import pool from "../config/db.js";
import { isValidInteger, isValidString, toNumberOrUndefined } from "../lib/validation.js";
import { createError } from "../lib/createError.js";

export async function getNotes(req, res, next) {
  try {
    const cleanUserId = toNumberOrUndefined(req?.user.id);

    if (!isValidInteger(cleanUserId)) {
      throw createError("User ID must be a valid positive integer.", 400);
    }

    const { rows: notes } = await pool.query("SELECT id, user_id, title, description, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC", [cleanUserId]);

    return res.status(200).json({ notes, message: "Notes fetched successfully."})
    
  } catch (err) {
    next(err);
  }
}

export async function getNote(req, res, next) {
  try {
    const cleanNoteId = toNumberOrUndefined(req?.params.id);
    const cleanUserId = toNumberOrUndefined(req?.user.id);

    if (!isValidInteger(cleanNoteId)) {
      throw createError("Note ID must be a valid positive integer.", 400);
    }

    if (!isValidInteger(cleanUserId)) {
      throw createError("User ID must be a valid positive integer.", 400);
    }

    const { rows } = await pool.query("SELECT id, user_id, title, description, created_at, updated_at FROM notes WHERE id = $1 AND user_id = $2", [cleanNoteId, cleanUserId]);

    if (rows.length === 0) {
      throw createError("Note does not exist.", 404);
    }
    
    return res.status(200).json({ note: rows[0], message: "Note fetched successfully."})
  } catch (err) {
    next(err);
  }
}

export async function createNote(req, res, next) {
  try {
    const cleanUserId = toNumberOrUndefined(req?.user.id);

    if (!isValidInteger(cleanUserId)) {
      throw createError("User ID must be a valid positive integer.", 400);
    }

    const { title, description } = req?.body;

    const cleanTitle = isValidString(title) ? title.trim() : undefined;
    const cleanDescription = isValidString(description) ? description.trim() : undefined;

    if (cleanTitle === undefined) {
      throw createError("Title must be a valid string.", 400);
    }
  
    if (cleanDescription === undefined) {
      throw createError("Description must be a valid string.", 400);
    }

    const { rows } = await pool.query(`INSERT INTO notes (user_id, title, description) VALUES ($1, $2, $3) RETURNING id, user_id, title, description, created_at, updated_at`, [cleanUserId, cleanTitle, cleanDescription]);

    res.status(201).json({note: rows[0], message: "Note created successfully."})
  } catch (err) {
    next(err);
  }
}

export async function updateNote(req, res, next) {
  try {
    const cleanNoteId = toNumberOrUndefined(req?.params.id);
    const cleanUserId = toNumberOrUndefined(req?.user.id);

    if (!isValidInteger(cleanNoteId)) {
      throw createError("Note ID must be a valid positive integer.", 400);
    }

    if (!isValidInteger(cleanUserId)) {
      throw createError("User ID must be a valid positive integer.", 400);
    }

    const { title, description } = req?.body || {};

    const cleanTitle = isValidString(title) ? title.trim() : undefined;
    const cleanDescription = isValidString(description) ? description.trim() : undefined;

    const updates = [];
    const values = [];
    let index = 1;

    if (title !== undefined) {
      if (cleanTitle === undefined) {
        throw createError("Title must be a valid string.", 400);
      }

      updates.push(`title = $${index++}`);
      values.push(cleanTitle);
    }
    
    if (description !== undefined) {
      if (cleanDescription === undefined) {
        throw createError("Description must be a valid string.", 400);
      }

      updates.push(`description = $${index++}`);
      values.push(cleanDescription);
    }

    if (updates.length === 0) {
      throw createError("No fields to update.", 400);
    }

    values.push(cleanNoteId, cleanUserId);

    const { rows } = await pool.query(`UPDATE notes SET ${updates.join(" ,")} WHERE id = $${index++} AND user_id = $${index} RETURNING id, user_id, title, description, created_at, updated_at`, values);

    if (rows.length === 0) {
      throw createError("Note does not exist.", 404)
    }

    res.status(200).json({updatedNote: rows[0], message: "Note updated successfully."})
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const cleanNoteId = toNumberOrUndefined(req?.params.id);
    const cleanUserId = toNumberOrUndefined(req?.user.id);

    if (!isValidInteger(cleanNoteId)) {
      throw createError("Note ID must be a valid positive integer.", 400);
    }

    if (!isValidInteger(cleanUserId)) {
      throw createError("User ID must be a valid positive integer.", 400);
    }

    const { rows } = await pool.query("DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id, user_id, title", [cleanNoteId, cleanUserId]);

    if (rows.length === 0) {
      throw createError("Note does not exist.", 404)
    }

    res.status(200).json({deletedNote: rows[0], message: "Note deleted successfully."})
  } catch (err) {
    next(err);
  }
}