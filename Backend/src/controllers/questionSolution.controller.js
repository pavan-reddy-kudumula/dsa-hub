import pool from "../config/db.js";
import { toNumberOrUndefined, isValidInteger, isValidString } from "../lib/validation.js";

export async function getQuestionSolutions(req, res, next) {
    try {
        const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);

        if(!isValidInteger(cleanQuestionId)) {
            const err = new Error("Question ID must be a valid positive integer.");
            err.statusCode = 400;
            throw err;
        }

        const { rows: questionSolutions } = await pool.query("SELECT * FROM question_solutions WHERE question_id = $1 ORDER BY language_name", [cleanQuestionId]);

        if(questionSolutions.length === 0) {
            const err = new Error("No Solutions found for the question.");
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({ questionSolutions, message: "Solutions fetched successfully."});
    } catch (err) {
        next(err);
    }
}

export async function getQuestionSolution(req, res, next) {
    try {
        const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);
        const cleanSolutionId = toNumberOrUndefined(req.params?.solutionId);

        if(!isValidInteger(cleanQuestionId) || !isValidInteger(cleanSolutionId)) {
            const err = new Error("Question ID and Solution ID must be a valid positive integers.");
            err.statusCode = 400;
            throw err;
        }

        const { rows } = await pool.query("SELECT * FROM question_solutions WHERE question_id = $1 AND id = $2", [cleanQuestionId, cleanSolutionId]);

        if(rows.length === 0) {
            const err = new Error("Solution does not exist for the question.");
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({ questionSolution: rows[0], message: "Solution fetched successfully."});
    } catch (err) {
        next(err);
    }
}

export async function createQuestionSolution(req, res, next) {
    try {
        const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);

        if(!isValidInteger(cleanQuestionId)) {
            const err = new Error("Question ID must be a valid positive integer.");
            err.statusCode = 400;
            throw err;
        }

        const { language_name, solution, description } = req?.body || {};

        const cleanLanguageName = isValidString(language_name) ? language_name.trim().toLowerCase() : undefined;
        const cleanSolution = isValidString(solution) ? solution : undefined;
        const cleanDescription = isValidString(description) ? description.trim() : null;

        if(cleanLanguageName === undefined || cleanSolution === undefined) {
            const err = new Error("Language name and solution must be non-empty strings.");
            err.statusCode = 400;
            throw err;
        }

        if(description !== undefined && cleanDescription === null) {
            const err = new Error("Description must be a non-empty string.");
            err.statusCode = 400;
            throw err;
        }

        const { rows } = await pool.query("INSERT INTO question_solutions (question_id, language_name, solution, description) VALUES ($1, $2, $3, $4) RETURNING *", [cleanQuestionId, cleanLanguageName, cleanSolution, cleanDescription]);

        return res.status(201).json({ questionSolution: rows[0], message: "Question Solution created successfully."});
    } catch (err) {
        if(err.code === "23505" && err.constraint === "question_solutions_uniq_question_id_language_name") {
            err.message = "A solution for this language already exists for this question.";
            err.statusCode = 409
        }
        next(err);
    }
}

export async function updateQuestionSolution(req, res, next) {
    try {
        const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);
        const cleanSolutionId = toNumberOrUndefined(req.params?.solutionId);

        if(!isValidInteger(cleanQuestionId) || !isValidInteger(cleanSolutionId)) {
            const err = new Error("Question ID and Solution ID must be a valid positive integers.");
            err.statusCode = 400;
            throw err;
        }

        const { language_name, solution, description } = req?.body || {};

        const cleanLanguageName = isValidString(language_name) ? language_name.trim().toLowerCase() : undefined;
        const cleanSolution = isValidString(solution) ? solution : undefined;
        const cleanDescription = isValidString(description) ? description.trim() : undefined;

        const queries = [];
        const values = [];
        let index = 1;

        if(language_name !== undefined && cleanLanguageName === undefined) {
            if(cleanLanguageName === undefined) {
                const err = new Error("Language name and solution must be non-empty strings.");
                err.statusCode = 400;
                throw err;
            }

            queries.push(`language_name = $${index++}`);
            values.push(cleanLanguageName);
        } 



        if(solution !== undefined) {
            if(cleanSolution === undefined) {
                const err = new Error("Solution must be a non-empty string.");
                err.statusCode = 400;
                throw err;
            }

            queries.push(`solution = $${index++}`);
            values.push(cleanSolution);
        }

        if(description !== undefined) {
            if(cleanDescription === null) {
                const err = new Error("Description must be a non-empty string.");
                err.statusCode = 400;
                throw err;
            }

            queries.push(`description = $${index++}`);
            values.push(cleanDescription);
        }

        values.push(cleanQuestionId, cleanSolutionId);

        if(queries.length === 0) {
            const err = new Error("No fields to update.");
            err.statusCode = 400;
            throw err;
        }

        const { rows } = await pool.query(`UPDATE question_solutions SET ${queries.join(", ")} WHERE question_id = $${index++} AND id = $${index} RETURNING *`, values);

        if(rows.length === 0) {
            const err = new Error("Solution does not exist for the question.");
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({ questionSolution: rows[0], message: "Solution updated successfully."});
    } catch (err) {
        if(err.code === "23505" && err.constraint === "question_solutions_uniq_question_id_language_name") {
            err.message = "A solution for this language already exists for this question.";
            err.statusCode = 409
        }
        next(err);
    }
}

export async function deleteQuestionSolution(req, res, next) {
    try {
        const cleanQuestionId = toNumberOrUndefined(req.params?.questionId);
        const cleanSolutionId = toNumberOrUndefined(req.params?.solutionId);

        if(!isValidInteger(cleanQuestionId) || !isValidInteger(cleanSolutionId)) {
            const err = new Error("Question ID and Solution ID must be a valid positive integers.");
            err.statusCode = 400;
            throw err;
        }

        const { rows } = await pool.query("DELETE FROM question_solutions WHERE question_id = $1 AND id = $2 RETURNING *", [cleanQuestionId, cleanSolutionId]);

        if(rows.length === 0) {
            const err = new Error("Solution does not exist for the question.");
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({ questionSolution: rows[0], message: "Solution deleted successfully."});
    } catch (err) {
        next(err);
    }
}