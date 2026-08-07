import pool from "../config/db.js"; 

const toNumberOrUndefined = (value) => value !== undefined ? Number(value) : undefined;

export async function getTopics(req, res, next) {
  try {
    const { rows: topics } = await pool.query("SELECT id, name FROM topics ORDER BY name");

    return res.status(200).json({topics, message: "Topics fetched successfully."})
  } catch(err) {
    next(err);
  }
}

export async function getTopic(req, res, next) {
  try {
    const cleanId = toNumberOrUndefined(req.params?.id);

    if (!Number.isInteger(cleanId) || cleanId < 1) {
      const err = new Error("Topic ID must be a positive integer.");
      err.statusCode = 400;
      throw err;
    }
    
    const { rows } = await pool.query("SELECT id, name FROM topics WHERE id = $1", [cleanId]);

    if (rows.length === 0) {
      const err = new Error("Topic does not exist.");
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json({ topic: rows[0], message: "Topic fetched successfully." });
  } catch (err) {
    next(err);
  }
}

export async function createTopic(req, res, next) {
  try {
    const cleanName = req.body?.name?.trim();

    if (typeof cleanName !== "string" || cleanName === "") {
      const err = new Error("Topic name must be a string.");
      err.statusCode = 400;
      throw err;
    }
    
    const { rows } = await pool.query("INSERT INTO topics (name) VALUES ($1) RETURNING id, name", [cleanName]);

    return res.status(201).json({ topic: rows[0], message: "Topic created successfully." });
  } catch (err) {
    
    if (err.code === '23505' && err.constraint === "topics_name_key") {
      err.message = "Topic already exists.";
      err.statusCode = 409;
    }
    
    next(err);
  }
}

export async function updateTopic(req, res, next) {
  try {
    const cleanId = toNumberOrUndefined(req.params?.id);
    const cleanName = req.body?.name?.trim();

    if (!Number.isInteger(cleanId) || cleanId < 1) {
      const err = new Error("Topic ID must be a positive integer.");
      err.statusCode = 400;
      throw err;
    }

    if (typeof cleanName !== "string" || cleanName === "") {
      const err = new Error("Name field is required and must be a string.");
      err.statusCode = 400;
      throw err;
    }
    
    const { rows } = await pool.query("UPDATE topics SET name = $1 WHERE id = $2 RETURNING id, name", [cleanName, cleanId]);

    if (rows.length === 0) {
      const err = new Error("Topic does not exist.");
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json({ topic: rows[0], message: "Topic updated successfully." });
  } catch (err) {

    if (err.code === "23505" && err.constraint === "topics_name_key") {
      err.message = "Topic already exists.";
      err.statusCode = 409;
    }
    
    next(err);
  }
}

export async function deleteTopic(req, res, next) {
  try {
    const cleanId = toNumberOrUndefined(req.params?.id);

    if (!Number.isInteger(cleanId) || cleanId < 1) {
      const err = new Error("Topic ID must be a positive integer.");
      err.statusCode = 400;
      throw err;
    }
    
    const { rows } = await pool.query("DELETE FROM topics WHERE id = $1 RETURNING id, name", [cleanId]);

    if (rows.length === 0) {
      const err = new Error("Topic does not exist.");
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json({ topic: rows[0], message: "Topic deleted successfully." });
  } catch (err) {
    next(err);
  }
}