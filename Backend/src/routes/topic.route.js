import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";
import { getTopic, getTopics, createTopic, updateTopic, deleteTopic } from "../controllers/topic.controller.js";

const router = express.Router();

router.get("/", getTopics);
router.get("/:id", getTopic);

router.post("/", protectRoute, verifyAdmin, createTopic);

router.patch("/:id", protectRoute, verifyAdmin, updateTopic);

router.delete("/:id", protectRoute, verifyAdmin, deleteTopic);

export default router;