import express from "express";
import { getUserQuestions, getUserQuestion, updateUserQuestion } from "../controllers/userQuestion.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/me/questions", protectRoute, getUserQuestions);
router.get("/me/questions/:questionId", protectRoute, getUserQuestion);
router.patch("/me/questions/:questionId", protectRoute, verifyAdmin, updateUserQuestion);

export default router;