import express from "express"
import { getQuestionPlatforms, createQuestionPlatform, updateQuestionPlatform, deleteQuestionPlatform } from "../controllers/questionPlatform.controller.js";

const router = express.Router();

router.get("/:questionId/platforms", getQuestionPlatforms);

router.post("/:questionId/platforms", createQuestionPlatform);

router.patch("/:questionId/platforms/:platform", updateQuestionPlatform);

router.delete("/:questionId/platforms/:platform", deleteQuestionPlatform);

export default router;