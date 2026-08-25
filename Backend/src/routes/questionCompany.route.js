import express from "express"
import { getQuestionCompanies, createQuestionCompanies, updateQuestionCompanies, deleteQuestionCompanies } from "../controllers/questionCompany.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import verifyAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/:questionId/companies", getQuestionCompanies);

router.post("/:questionId/companies", protectRoute, verifyAdmin, createQuestionCompanies);

router.put("/:questionId/companies", protectRoute, verifyAdmin, updateQuestionCompanies);

router.delete("/:questionId/companies", protectRoute, verifyAdmin, deleteQuestionCompanies);

export default router;