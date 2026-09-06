import express from "express"
import { getQuestionSolutions, getQuestionSolution, createQuestionSolution, updateQuestionSolution, deleteQuestionSolution} from "../controllers/questionSolution.controller.js";

const router = express.Router();

router.get("/:questionId/solutions", getQuestionSolutions);
router.get("/:questionId/solutions/:solutionId", getQuestionSolution);

router.post("/:questionId/solutions", createQuestionSolution);

router.patch("/:questionId/solutions/:solutionId", updateQuestionSolution);

router.delete("/:questionId/solutions/:solutionId", deleteQuestionSolution);

export default router;