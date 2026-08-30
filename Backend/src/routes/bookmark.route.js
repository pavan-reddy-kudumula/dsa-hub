import express from "express"
import { getBookmarks, createBookmark, deleteBookmark } from "../controllers/bookmark.controller.js"
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getBookmarks);

router.post("/", protectRoute, createBookmark);

router.delete("/:questionId", protectRoute, deleteBookmark);

export default router;