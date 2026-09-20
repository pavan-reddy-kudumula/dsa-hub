import express from "express"
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";
import { getQuestionById, updateQuestion, deleteQuestion } from "../controllers/question.controller.js"

const router = express.Router();

router.get("/:id", protectRoute, getQuestionById);

router.patch("/:id", protectRoute, verifyAdmin, updateQuestion);

router.delete("/:id", protectRoute, verifyAdmin, deleteQuestion);

export default router;