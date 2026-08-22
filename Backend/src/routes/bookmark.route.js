import express from "express"
import { getBookmarks, createBookmark, deleteBookmark } from "../controllers/bookmark.controller.js"
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getBookmarks);

router.post("/", protectRoute, verifyAdmin, createBookmark);

router.delete("/:questionId", protectRoute, verifyAdmin, deleteBookmark);

export default router;