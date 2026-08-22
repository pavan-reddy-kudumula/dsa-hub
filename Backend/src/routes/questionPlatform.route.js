import express from "express"
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";
import { getQuestionPlatforms, createQuestionPlatform, updateQuestionPlatform, deleteQuestionPlatform } from "../controllers/questionPlatform.controller.js";

const router = express.Router();

router.get("/:questionId/platforms", getQuestionPlatforms);

router.post("/:questionId/platforms", protectRoute, verifyAdmin, createQuestionPlatform);

router.patch("/:questionId/platforms/:platform", protectRoute, verifyAdmin, updateQuestionPlatform);

router.delete("/:questionId/platforms/:platform", protectRoute, verifyAdmin, deleteQuestionPlatform);

export default router;