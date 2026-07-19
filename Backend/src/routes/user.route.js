import express from "express"
import { getUser, updateUserData, updateUserProfilePic, deleteUser, getAllUsers } from "../controllers/user.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/all", getAllUsers);
router.patch("/me",protectRoute, updateUserData);
router.patch("/me/profile-picture", protectRoute, updateUserProfilePic);
router.delete("/me", protectRoute, deleteUser);

router.get("/:username", getUser);

export default router;