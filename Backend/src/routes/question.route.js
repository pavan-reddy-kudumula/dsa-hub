import express from "express"
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";
import { getQuestionById, getQuestionExamples, createQuestionExample, updateQuestion, updateQuestionExample, deleteQuestion, deleteQuestionExample } from "../controllers/question.controller.js"

const router = express.Router();

router.get("/:id", getQuestionById);
router.get("/:id/examples", getQuestionExamples);

router.post("/:id/examples", protectRoute, verifyAdmin, createQuestionExample);

router.patch("/:id", protectRoute, verifyAdmin, updateQuestion);
router.patch("/:id/examples/:exampleId", protectRoute, verifyAdmin, updateQuestionExample)

router.delete("/:id", protectRoute, verifyAdmin, deleteQuestion);
router.delete("/:id/examples/:exampleId", protectRoute, verifyAdmin, deleteQuestionExample);

export default router;