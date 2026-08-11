import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";
import { getQuestionExamples, createQuestionExample, updateQuestionExample, deleteQuestionExample } from "../controllers/questionExample.controller.js";

const router = express.Router();

router.get("/:id/examples", getQuestionExamples);

router.post("/:id/examples", protectRoute, verifyAdmin, createQuestionExample);

router.patch("/:id/examples/:exampleId", protectRoute, verifyAdmin, updateQuestionExample)

router.delete("/:id/examples/:exampleId", protectRoute, verifyAdmin, deleteQuestionExample);

export default router;