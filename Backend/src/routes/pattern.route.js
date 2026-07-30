import express from "express"
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";
import { getPatterns, getPatternById, createPattern, updatePattern, deletePattern, getPatternQuestions, createQuestion } from "../controllers/pattern.controller.js";

const router = express.Router();

router.get("/", getPatterns);
router.get("/:id", getPatternById);
router.get("/:patternId/questions", protectRoute, getPatternQuestions);

router.post("/", protectRoute, verifyAdmin, createPattern);
router.post("/:patternId/questions", protectRoute, verifyAdmin, createQuestion);

router.patch("/:id", protectRoute, verifyAdmin, updatePattern);
router.delete("/:id", protectRoute, verifyAdmin, deletePattern);

export default router;