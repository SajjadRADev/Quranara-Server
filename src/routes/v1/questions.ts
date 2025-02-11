import express from "express";
import { getQuestions, getQuestion, getAllQuestions, create, message, answer, close } from "@/controllers/v1/questions";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateQuestionSchema, AnswerQuestionSchema, GetAllQuestionsQuerySchema } from "@/validators/questions";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth);

router.route("/").get(validator("query", PaginationQuerySchema), getQuestions as any).post(validator("body", CreateQuestionSchema), create);
router.get("/all", roleGuard(ROLES.MANAGER), validator("query", GetAllQuestionsQuerySchema), getAllQuestions as any);
router.get("/:id", getQuestion);
router.post("/:id/message", validator("body", CreateQuestionSchema), message);

router.use(roleGuard(ROLES.MANAGER));

router.post("/:id/answer", validator("body", AnswerQuestionSchema), answer);
router.patch("/:id/close", close);

export default router;
