import express from "express"
import { getUser, updateUserData, updateUserProfilePic, updateUserRole, deleteUser } from "../controllers/user.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.patch("/me",protectRoute, updateUserData);
router.patch("/me/profile-picture", protectRoute, updateUserProfilePic);
router.patch("/:id/role", protectRoute, verifyAdmin, updateUserRole);
router.delete("/me", protectRoute, deleteUser);

router.get("/:username", getUser);

export default router;