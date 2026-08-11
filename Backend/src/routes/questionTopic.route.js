import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";
import { getQuestionTopics, getAllQuestionsTopics, createQuestionTopics, updateQuestionTopics, deleteQuestionTopics } from "../controllers/questionTopic.controller.js"

const router = express.Router();

router.get("/all/topics", getAllQuestionsTopics);

router.get("/:questionId/topics", getQuestionTopics);

router.post("/:questionId/topics", protectRoute, verifyAdmin, createQuestionTopics);

router.put("/:questionId/topics", protectRoute, verifyAdmin, updateQuestionTopics);

router.delete("/:questionId/topics", protectRoute, verifyAdmin, deleteQuestionTopics);

export default router;