import express from "express"
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";
import { getPatterns, getPatternById, createPattern } from "../controllers/pattern.controller.js";

const router = express.Router();

router.get("/", getPatterns);
router.get("/:id", getPatternById);
router.post("/", protectRoute, verifyAdmin, createPattern);
// router.patch("/:id", protectRoute, verifyAdmin, updatePattern);
// router.delete("/:id", protectRoute, verifyAdmin, deletePattern);

export default router;