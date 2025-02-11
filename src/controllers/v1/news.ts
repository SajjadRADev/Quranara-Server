import { NextFunction, Request, Response } from "express";

import NewsModel from "@/models/News";

import { CreateNewsSchemaType, UpdateNewsSchemaType } from "@/validators/news";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestParamsWithID } from "@/types/request.types";

import { NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { createPaginationData } from "@/utils/funcs";

export const getAll = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const news = await NewsModel.find({})
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const newsCount = await NewsModel.countDocuments({});

        SuccessResponse(res, 200, { news, pagination: createPaginationData(page, limit, newsCount) });
    } catch (err) {
        next(err);
    }
};

export const getAllShown = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const news = await NewsModel.find({ shown: true }).sort({ createdAt: -1 }).lean();
        SuccessResponse(res, 200, { news });
    } catch (err) {
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const news = await NewsModel.findById(id).lean();

        if (!news) {
            throw new NotFoundException("new not found!");
        }

        SuccessResponse(res, 200, { news });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateNewsSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { cover, title, description, link, shown } = req.body;

        await NewsModel.create({
            cover,
            title,
            description,
            link,
            shown,
        });

        SuccessResponse(res, 201, { message: "news created successfully" });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, UpdateNewsSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { cover, title, description, link } = req.body;

        const news = await NewsModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    cover,
                    description,
                    title,
                    link,
                },
            },
            { new: true }
        );

        if (!news) {
            throw new NotFoundException("news not found");
        }

        SuccessResponse(res, 200, { message: "news updated successfully" });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const news = await NewsModel.findByIdAndDelete(id);

        if (!news) {
            throw new NotFoundException("news not found");
        }

        SuccessResponse(res, 200, { message: "news removed successfully" });
    } catch (err) {
        next(err);
    }
};

export const shown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const news = await NewsModel.findByIdAndUpdate(
            id,
            {
                $set: { shown: true },
            },
            { new: true }
        );

        if (!news) {
            throw new NotFoundException("news not found");
        }

        SuccessResponse(res, 200, { message: "shown set successfully" });
    } catch (err) {
        next(err);
    }
};

export const unshown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const news = await NewsModel.findByIdAndUpdate(
            id,
            {
                $set: { shown: false },
            },
            { new: true }
        );

        if (!news) {
            throw new NotFoundException("news not found");
        }

        SuccessResponse(res, 200, { message: "shown unset successfully" });
    } catch (err) {
        next(err);
    }
};
