import { NextFunction, Request, Response } from "express";

import QuestionModel from "@/models/Question";
import QuestionMessageModel from "@/models/QuestionMessage";
import SessionModel, { PopulatedCourse } from "@/models/Session";

import { CreateQuestionSchemaType, AnswerQuestionSchemaType, GetAllQuestionsQuerySchemaType } from "@/validators/questions";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestWithUser } from "@/types/request.types";

import { STATUS } from "@/constants/questions";

import { ForbiddenException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";

type RequestParamsWithID = { id: string };

export const getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const questions = await QuestionModel.find({ user: (req as RequestWithUser).user._id })
            .populate("session", "slug")
            .skip((page - 1) * limit)
            .limit(limit);

        SuccessResponse(res, 200, { questions });
    } catch (err) {
        next(err);
    }
};

export const getQuestion = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const question = await QuestionModel.findById(id)
            .populate({ path: "messages", populate: { path: "user" } })
            .lean();

        if (!question) {
            throw new NotFoundException("question not found");
        }

        SuccessResponse(res, 200, { question });
    } catch (err) {
        next(err);
    }
};

export const getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, status } = req.query as unknown as GetAllQuestionsQuerySchemaType;

        const questions = await QuestionModel.find({ status })
            .skip((page - 1) * limit)
            .limit(limit);

        SuccessResponse(res, 200, { questions });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateQuestionSchemaType>, res: Response, next: NextFunction) => {
    try {
        const user = (req as RequestWithUser).user;
        const { session: sessionId, content, attached } = req.body;

        const session = await SessionModel.findById(sessionId).populate<{ course: PopulatedCourse }>("course");

        if (!session) {
            throw new NotFoundException("session not found");
        }

        const hasAccess = await session.hasUserAccess(user._id);

        if (!hasAccess) {
            throw new ForbiddenException("you can not access to this action");
        }

        const title = `${session.course.title} - ${session.title}`;

        const question = await QuestionModel.create({
            session: session._id,
            user: user._id,
            title,
        });

        const message = await QuestionMessageModel.create({
            user: user._id,
            content,
            question: question._id,
            attached,
        });

        SuccessResponse(res, 201, { question, message });
    } catch (err) {
        next(err);
    }
};

export const message = async (req: Request<RequestParamsWithID, {}, CreateQuestionSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = (req as RequestWithUser<RequestParamsWithID>).user;
        const { session: sessionId, content, attached } = req.body;

        const session = await SessionModel.findById(sessionId);

        if (!session) {
            throw new NotFoundException("session not found");
        }

        const hasAccess = await session.hasUserAccess(user._id);

        if (!hasAccess) {
            throw new ForbiddenException("you can not access to this action");
        }

        const question = await QuestionModel.findByIdAndUpdate(id, {
            $set: { status: STATUS.ACTIVE },
        });

        if (!question) {
            throw new NotFoundException("question not found");
        }

        const message = await QuestionMessageModel.create({
            user: user._id,
            content,
            question: question._id,
            attached,
        });

        SuccessResponse(res, 201, { message });
    } catch (err) {
        next(err);
    }
};

export const answer = async (req: Request<RequestParamsWithID, {}, AnswerQuestionSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = (req as RequestWithUser<RequestParamsWithID>).user;
        const { content, attached } = req.body;

        const question = await QuestionModel.findByIdAndUpdate(id, {
            $set: { status: STATUS.SLEEP },
        });

        if (!question) {
            throw new NotFoundException("question not found");
        }

        const answer = await QuestionMessageModel.create({
            user: user._id,
            question: question._id,
            content,
            attached,
        });

        SuccessResponse(res, 201, { answer });
    } catch (err) {
        next(err);
    }
};