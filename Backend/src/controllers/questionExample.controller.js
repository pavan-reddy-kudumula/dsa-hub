import pool from "../config/db.js";

const toNumberOrUndefined = (value) => value !== undefined ? Number(value) : undefined;

const insertQueryField = (updates, values, field, fieldVal) => {
    updates.push(`${field} = $${values.length + 1}`);
    values.push(fieldVal);
}

export async function getQuestionExamples(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.id);

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const { rows: questionExamples } = await pool.query("SELECT id, question_id, input, output, explanation FROM question_examples WHERE question_id = $1", [cleanQuestionId]);

    return res.status(200).json({questionExamples, message: "Question examples fetched successfully."})
  } catch (err) {
    next(err);
  }
}

export async function createQuestionExample(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.id); 
    
    const { input, output, explanation } = req.body || {};

    const cleanInput = typeof input === "string" && input.trim() !== "" ? input.trim() : undefined;
    const cleanOutput = typeof output === "string" && output.trim() !== "" ? output.trim() : undefined;
    let cleanExplanation;

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a positive integer.");
      err.statusCode = 400;
      throw err;
    }
    
    if (cleanInput === undefined || cleanOutput === undefined) {
      const err = new Error("Input and output are required.");
      err.statusCode = 400;
      throw err;
    }
    
    if (explanation !== undefined) {
      if (typeof explanation !== "string") {
        const err = new Error("Explanation must be text.");
        err.statusCode = 400;
        throw err;
      }

      cleanExplanation = explanation.trim();
    }

    const { rows: question } = await pool.query("SELECT exists (SELECT 1 FROM questions WHERE id = $1) AS exists", [cleanQuestionId]);

    if (!question[0].exists) {
      const err = new Error("Question does not exist.");
      err.statusCode = 400;
      throw err;
    }
    
    const result = await pool.query("INSERT INTO question_examples (question_id, input, output, explanation) VALUES ($1, $2, $3, $4) RETURNING id, question_id, input, output, explanation", [cleanQuestionId, cleanInput, cleanOutput, cleanExplanation]);

    return res.status(201).json({ questionExample: result.rows[0], message: "question example created successfully" });
    
  } catch (err) {
    next(err);
  }
}

export async function updateQuestionExample(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.id);
    const cleanQuestionExampleId = toNumberOrUndefined(req.params?.exampleId);
    
    const { input, output, explanation } = req.body || {};
    
    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a positive integer.");
      err.statusCode = 400;
      throw err;
    }
    
    if (!Number.isInteger(cleanQuestionExampleId) || cleanQuestionExampleId < 1) {
      const err = new Error("Question Example ID must be a positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const updates = [];
    const values = [];

    if (input !== undefined) {
      if (typeof input !== "string" || input.trim() === "") {
        const err = new Error("Input is required.");
        err.statusCode = 400;
        throw err;
      }

      insertQueryField(updates, values, "input", input.trim());
    }
    
    if (output !== undefined) {
      if (typeof output !== "string" || output.trim() === "") {
        const err = new Error("Output is required.");
        err.statusCode = 400;
        throw err;
      }

      insertQueryField(updates, values, "output", output.trim());
    }
    
    if (explanation !== undefined) {
      if (typeof explanation !== "string") {
        const err = new Error("Explanation must be text.");
        err.statusCode = 400;
        throw err;
      }

      insertQueryField(updates, values, "explanation", explanation.trim());
    }

    if (updates.length === 0) {
        const err = new Error("At least one field (input, output, or explanation) must be provided.");
        err.statusCode = 400;
        throw err;
    }
    
    const questionIdIndex = values.length + 1;
    const exampleIdIndex = values.length + 2;
    values.push(cleanQuestionId, cleanQuestionExampleId);
    
    const result = await pool.query(`UPDATE question_examples SET ${updates.join(", ")} WHERE question_id = $${questionIdIndex} AND id = $${exampleIdIndex} RETURNING id, question_id, input, output, explanation`, values);

    if (result.rows.length === 0) {
        const err = new Error("Question Example not found.");
        err.statusCode = 404;
        throw err;
    }

    return res.status(200).json({ questionExample: result.rows[0], message: "Question example updated successfully." });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuestionExample(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.id);
    const cleanQuestionExampleId = toNumberOrUndefined(req.params?.exampleId);

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a positive integer.");
      err.statusCode = 400;
      throw err;
    }
    
    if (!Number.isInteger(cleanQuestionExampleId) || cleanQuestionExampleId < 1) {
      const err = new Error("Question Example ID must be a positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const { rows } = await pool.query("DELETE FROM question_examples WHERE question_id = $1 AND id = $2 RETURNING id, question_id, input, output, explanation", [cleanQuestionId, cleanQuestionExampleId]);

    if (rows.length === 0) {
      const err = new Error("Question example does not exist.");
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json({questionExample: rows[0], message: "Question example deleted successfully."})
  } catch (err) {
    next(err);
  }
}