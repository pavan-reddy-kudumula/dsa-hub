import pool from "../config/db.js";
import { difficultyEnum } from "../constants/enums.js";

const toNumberOrUndefined = (value) => value !== undefined ? Number(value) : undefined;

const insertQueryField = (updates, values, field, fieldVal) => {
    updates.push(`${field} = $${values.length + 1}`);
    values.push(fieldVal);
}
  
export async function getQuestionById(req, res, next) {
  try {
    const questionId = req.params?.id;
    const cleanQuestionId  = toNumberOrUndefined(questionId);

    if (!Number.isInteger(cleanQuestionId ) || cleanQuestionId  < 1) {
      const err = new Error("questionId requires a postive integer");
      err.statusCode = 400;
      throw err;
    }
    
    const [
      questionResult,
      topicsResult,
      examplesResult,
      solutionsResult,
      linksResult,
      companiesResult
    ] = await Promise.all([
      pool.query(
        `SELECT id, title, problem_statement, notes, difficulty, display_order, estimated_time, xp FROM questions WHERE id = $1`,
        [cleanQuestionId]
      ),
      pool.query(
        `SELECT topic_id, name AS topic_name FROM question_topics AS qt JOIN topics AS t ON qt.topic_id = t.id WHERE qt.question_id = $1`,
        [cleanQuestionId]
      ),
      pool.query(
        `SELECT id, input, output, explanation FROM question_examples WHERE question_id = $1`,
        [cleanQuestionId]
      ),
      pool.query(
        `SELECT id, language_name, solution, description FROM question_solutions WHERE question_id = $1 ORDER BY language_name`,
        [cleanQuestionId]
      ),
      pool.query(
        `SELECT id, platform, link FROM question_platform_links WHERE question_id = $1`,
        [cleanQuestionId]
      ),
      pool.query(
        `SELECT qc.company_id, c.name FROM question_companies AS qc INNER JOIN companies AS c ON qc.company_id = c.id WHERE qc.question_id = $1 ORDER BY c.name`,
        [cleanQuestionId]
      )
    ]);

    if (questionResult.rows.length === 0) {
      const err = new Error("Question does not exist");
      err.statusCode = 404;
      throw err;
    }
    
    return res.status(200).json({ questionDetails: {
      question: questionResult.rows[0],
      topics: topicsResult.rows,
      examples: examplesResult.rows,
      solutions: solutionsResult.rows,
      platform_links: linksResult.rows,
      companies: companiesResult.rows
    }, message: "Question details fetched successfully."});
  } catch (err) {
    next(err);
  }
}

export async function updateQuestion(req, res, next) {
  let client;
  let transactionBegin = false;
  try {
    const { title, problem_statement, notes, difficulty, display_order, estimated_time, xp } = req.body || {};

    let cleanTitle;
    let cleanProblemStatement;
    let cleanNotes;
    let cleanDifficulty = typeof difficulty === "string" ? difficulty.trim().toLowerCase(): difficulty;
    const cleanQuestionId = toNumberOrUndefined(req.params?.id);
    const cleanDisplayOrder = toNumberOrUndefined(display_order);
    const cleanEstimatedTime = toNumberOrUndefined(estimated_time);
    const cleanXp = toNumberOrUndefined(xp);

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Invalid question id");
      err.statusCode = 400;
      throw err;
    }

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        const err = new Error("Title must be text.");
        err.statusCode = 400;
        throw err;   
      } 

      cleanTitle = title.trim();
    }
    
    if (problem_statement !== undefined) {
      if (typeof problem_statement !== "string" || problem_statement.trim() === "") {
        const err = new Error("problem statement must be text.");
        err.statusCode = 400;
        throw err;   
      }

      cleanProblemStatement = problem_statement.trim();
    }
    
    if (cleanDifficulty !== undefined) {
      if (typeof cleanDifficulty !== "string" || !difficultyEnum.includes(cleanDifficulty)) {
        const err = new Error("difficulty must be basic, easy, medium or hard.");
        err.statusCode = 400;
        throw err;   
      } 
    }

    if (notes !== undefined) {
      if (typeof notes !== "string" || notes.trim() === "") {
        const err = new Error("notes must be text.");
        err.statusCode = 400;
        throw err;   
      }

      cleanNotes = notes.trim();
    }

    if (cleanEstimatedTime !== undefined && (!Number.isInteger(cleanEstimatedTime) || cleanEstimatedTime <= 0)) {
      const err = new Error("Estimated time must be a positive integer");
      err.statusCode = 400;
      throw err;
    }
    
    if (cleanXp !== undefined && (!Number.isInteger(cleanXp) || cleanXp < 1)) {
      const err = new Error("Positive integer is required for xp.");
      err.statusCode = 400;
      throw err;      
    }
    
    const updates = [];
    const values = []
    
    if (cleanTitle !== undefined) {
      insertQueryField(updates, values, "title", cleanTitle);
    }
    
    if (cleanProblemStatement !== undefined) {
      insertQueryField(updates, values, "problem_statement", cleanProblemStatement);
    }
    
    if (cleanNotes !== undefined) {
      insertQueryField(updates, values, "notes", cleanNotes);
    }
    
    if (cleanDifficulty !== undefined) {
      insertQueryField(updates, values, "difficulty", cleanDifficulty);
    }
    
    if (cleanEstimatedTime !== undefined) {
      insertQueryField(updates, values, "estimated_time", cleanEstimatedTime);
    }
    
    if (cleanXp !== undefined) {
      insertQueryField(updates, values, "xp", cleanXp);
    }

    client = await pool.connect();
    await client.query("BEGIN");
    transactionBegin = true;


    if (cleanDisplayOrder !== undefined) {
      await client.query("LOCK TABLE questions IN EXCLUSIVE MODE");
      
      const patternRes = await client.query("SELECT pattern_id, display_order FROM questions WHERE id = $1", [cleanQuestionId]);
      if (patternRes.rows.length === 0) {
          const err = new Error("Question not found");
          err.statusCode = 404;
          throw err;
      }
      const patternId = patternRes.rows[0].pattern_id;
      
      const existingDisplayOrder = patternRes.rows[0].display_order;
      const maxRes = await client.query("SELECT COALESCE(MAX(display_order), 0) AS max_display_order FROM questions WHERE pattern_id = $1", [patternId]);
      const maxDisplayOrder = Number(maxRes.rows[0].max_display_order);
      
      if (!Number.isInteger(cleanDisplayOrder) || cleanDisplayOrder < 1 || cleanDisplayOrder > maxDisplayOrder) {
        const err = new Error("display_order must be a positive integer within existing display order");
        err.statusCode = 400;
        throw err;
      }

      if (cleanDisplayOrder > existingDisplayOrder) {
        await client.query("UPDATE questions SET display_order = display_order - 1 WHERE pattern_id = $1 AND display_order > $2 AND display_order <= $3", [patternId, existingDisplayOrder, cleanDisplayOrder]);
      } else if (cleanDisplayOrder < existingDisplayOrder) {
        await client.query("UPDATE questions SET display_order = display_order + 1 WHERE pattern_id = $1 AND display_order >= $2 AND display_order < $3", [patternId, cleanDisplayOrder, existingDisplayOrder]);       
      }

      insertQueryField(updates, values, "display_order", cleanDisplayOrder);
    }

    values.push(cleanQuestionId);

    if (updates.length === 0) {
        const err = new Error("No fields to update");
        err.statusCode = 400;
        throw err;
    }
    
    const result = await client.query(`UPDATE questions SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING id, title, problem_statement, notes, difficulty, estimated_time, display_order, xp`, values);

    if (result.rows.length === 0) {
        const err = new Error("Question not found");
        err.statusCode = 404;
        throw err;
    }
    
    await client.query("COMMIT");
    transactionBegin = false;
    
    return res.status(200).json({ question: result.rows[0], message: "Question updated successfully" });
  } catch (err) {
    if (client && transactionBegin) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.log("error in rollback", rollbackErr);
      }
    }
    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function deleteQuestion(req, res, next) {
  let client;
  let transactionBegin = false;
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.id);

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("question_id must be a positive integer");
      err.statusCode = 400;
      throw err;
    }

    client = await pool.connect();
    await client.query("BEGIN");
    transactionBegin = true;

    const { rows } = await client.query("SELECT pattern_id, display_order FROM questions WHERE id = $1", [cleanQuestionId]);
    if (rows.length === 0) {
      const err = new Error("question does not exist");
      err.statusCode = 404;
      throw err;
    }
    const { pattern_id: patternId, display_order: existingOrderNum } = rows[0];
    
    const { rows: questionRows } = await client.query("DELETE FROM questions WHERE id = $1 RETURNING title", [cleanQuestionId]);
    
    await client.query("UPDATE questions SET display_order = display_order - 1 WHERE pattern_id = $1 AND display_order > $2", [patternId, existingOrderNum]);

    await client.query("COMMIT");
    transactionBegin = false;

    return res.status(200).json({question: questionRows[0], message: "question deleted successfully" });
    
  } catch (err) {
    if (client && transactionBegin) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("ROLLBACK failed in deleteQuestion:", rollbackErr);
      }
    }
    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
}