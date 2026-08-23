import express from "express"
import { getNotes, getNote, createNote, updateNote, deleteNote } from "../controllers/note.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getNotes);
router.get("/:id", protectRoute, getNote);

router.post("/", protectRoute, createNote);

router.patch("/:id", protectRoute, updateNote);

router.delete("/:id", protectRoute, deleteNote);


export default router;