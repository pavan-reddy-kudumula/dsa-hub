import express from "express"
import { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } from "../controllers/company.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", getCompanies);
router.get("/:id", getCompany);

router.post("/", protectRoute, verifyAdmin, createCompany);

router.put("/:id", protectRoute, verifyAdmin, updateCompany);

router.delete("/:id", protectRoute, verifyAdmin, deleteCompany);


export default router;