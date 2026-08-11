import pool from "../config/db.js"

const toNumberOrUndefined = (value) => value !== undefined ? Number(value) : undefined;

const isValidArray = (topicIds) => {
  if (!Array.isArray(topicIds)) {
    const err = new Error("Topic IDs must be an array.");
    err.statusCode = 400;
    throw err;
  }
  
  if (topicIds.length === 0 || !topicIds.every((id) => Number.isInteger(id) && id > 0)) {
    const err = new Error("All IDs must be integers and there must be atleast one ID.");
    err.statusCode = 400;
    throw err;
  }

  const uniqueTopicIds = new Set(topicIds);
  
  if (uniqueTopicIds.size !== topicIds.length) {
    const err = new Error("Topic IDs must be unique.");
    err.statusCode = 400;
    throw err;
  }

  return topicIds;
}

export async function getQuestionTopics(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question Id must be a valid positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const { rows: questionTopics } = await pool.query("SELECT question_id, topic_id, name AS topic_name FROM question_topics AS qt JOIN topics AS t ON qt.topic_id = t.id WHERE qt.question_id = $1", [cleanQuestionId]);

    return res.status(200).json({questionTopics, message: "Question Topics fetched successfully."})
  } catch (err) {
    next(err);
  }
}

export async function getAllQuestionsTopics(req, res, next) {
  try {
    const { rows: questionTopics } = await pool.query("SELECT question_id, topic_id, name AS topic_name FROM question_topics AS qt JOIN topics AS t ON qt.topic_id = t.id");

    return res.status(200).json({questionTopics, message: "Question Topics fetched successfully."})
  } catch (err) {
    next(err);
  }
}

export async function createQuestionTopics(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);
    const topicIds = isValidArray(req.body?.topicIds);

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a valid positive integer.");
      err.statusCode = 400;
      throw err;
    }

    const values = [];
    const placeholders = topicIds.map((topicId, index) => {
      values.push(cleanQuestionId, topicId);
      const base = index * 2;
      return `($${base + 1}, $${base + 2})`;
    })

    const { rows } = await pool.query(`INSERT INTO question_topics (question_id, topic_id) VALUES ${placeholders.join(", ")} RETURNING question_id, topic_id`, values);

    return res.status(201).json({ questionTopics: rows, message: "Question Topics created successfully." });
  } catch (err) {
    if (err.code === "23505" && err.constraint === "question_topics_pkey") {
      err.message = "Question ID and Topic ID combination must be unique.";
      err.statusCode = 409;
    }
    if (err.code === "23503" && err.constraint === "question_topics_question_id_fkey") {
      err.message = "Question ID does not exist.";
      err.statusCode = 404;
    }
    if (err.code === "23503" && err.constraint === "question_topics_topic_id_fkey") {
      err.message = "Topic ID does not exist.";
      err.statusCode = 404;
    }
    next(err);
  }
}

export async function updateQuestionTopics(req, res, next) {
  let client;
  let transactionBegin = false;
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);
    const topicIds = isValidArray(req.body?.topicIds);

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a valid positive integer.");
      err.statusCode = 400;
      throw err;
    }
    
    const values = [];
    const placeholders = topicIds.map((topicId, index) => {
      values.push(cleanQuestionId, topicId);
      const base = index * 2;
      return `($${base + 1}, $${base + 2})`;
    })

    client = await pool.connect();
    await client.query("BEGIN");
    transactionBegin = true;

    await client.query("DELETE FROM question_topics WHERE question_id = $1", [cleanQuestionId]);

    const { rows } = await client.query(`INSERT INTO question_topics (question_id, topic_id) VALUES ${placeholders.join(", ")} RETURNING question_id, topic_id`, values);

    await client.query("COMMIT");
    transactionBegin = false;
    
    return res.status(200).json({ questionTopics: rows, message: "Question Topics updated successfully." });
  } catch (err) {
    if (client && transactionBegin) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.log("Rollback error in update question topics:", rollbackErr);
      }
    }
    if (err.code === "23505" && err.constraint === "question_topics_pkey") {
      err.message = "Question ID and Topic ID combination must be unique.";
      err.statusCode = 409;
    }
    if (err.code === "23503" && err.constraint === "question_topics_question_id_fkey") {
      err.message = "Question ID does not exist.";
      err.statusCode = 404;
    }
    if (err.code === "23503" && err.constraint === "question_topics_topic_id_fkey") {
      err.message = "Topic ID does not exist.";
      err.statusCode = 404;
    }
    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function deleteQuestionTopics(req, res, next) {
  try {
    const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);
    const topicIds = isValidArray(req.body?.topicIds);

    if (!Number.isInteger(cleanQuestionId) || cleanQuestionId < 1) {
      const err = new Error("Question ID must be a valid positive integer.");
      err.statusCode = 400;
      throw err;
    }
    
    const { rows: deletedTopics } = await pool.query("DELETE FROM question_topics WHERE question_id = $1 AND topic_id = ANY($2::int[]) RETURNING topic_id", [cleanQuestionId, topicIds]);

    return res.status(200).json({deletedTopics, message: "Question topics deleted successfully."})
  } catch (err) {
    next(err);
  }
}