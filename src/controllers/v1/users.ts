import { NextFunction, Request, Response } from "express";

import UserModel from "@/models/User";
import BanModel from "@/models/Ban";
import CourseUserModel from "@/models/CourseUser";

import { CreateUserSchemaType, BanUserSchemaType, UnbanUserSchemaType, SigningCourseSchemaType, GetAllUsersQuerySchemaType } from "@/validators/users";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { ConflictException, ForbiddenException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { createPaginationData } from "@/utils/funcs";
import { removeAllSession } from "@/utils/auth";
import { isDuplicateKeyError } from "@/utils/errors";

export const getAll = async (req: Request<{}, {}, {}, GetAllUsersQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, search } = req.query;

        const filters = { isBanned: false, ...(search && { $or: [{ fullname: { $regex: search } }, { username: { $regex: search } }] }) };

        const users = await UserModel.find(filters)
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const usersCount = await UserModel.countDocuments(filters);

        SuccessResponse(res, 200, { users, pagination: createPaginationData(page, limit, usersCount) });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateUserSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { phone, fullname, password } = req.body;

        const isBanned = await BanModel.findOne({ phone });

        if (isBanned) {
            throw new ForbiddenException("this account has been blocked");
        }

        await UserModel.create({ phone, fullname, username: fullname, password });

        SuccessResponse(res, 201, { message: "user created successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("user already exists with this information"));
        }
        next(err);
    }
};

export const getAllBan = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const bans = await BanModel.find({})
            .sort({ _id: -1 })
            .populate("user")
            .skip((page - 1) * limit)
            .limit(limit);

        const bansCount = await BanModel.countDocuments({});

        SuccessResponse(res, 200, { bans, pagination: createPaginationData(page, limit, bansCount) });
    } catch (err) {
        next(err);
    }
};

export const banUser = async (req: Request<{}, {}, BanUserSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { user: userId } = req.body;

        const user = await UserModel.findByIdAndUpdate(userId, { $set: { isBanned: true } });

        if (!user) {
            throw new NotFoundException("user not found");
        }

        await BanModel.create({ phone: user.phone, user: user._id });

        await removeAllSession(user._id.toString());

        SuccessResponse(res, 201, { message: "user banned successfully" });
    } catch (err) {
        next(err);
    }
};

export const unbanUser = async (req: Request<{}, {}, UnbanUserSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { ban: banId } = req.body;

        const ban = await BanModel.findById(banId);

        if (!ban) {
            throw new NotFoundException("ban not found");
        }

        await UserModel.updateOne({ _id: ban.user }, { $set: { isBanned: false } });

        await ban.deleteOne();

        SuccessResponse(res, 200, { message: "user unbanned successfully" });
    } catch (err) {
        next(err);
    }
};

export const signingCourse = async (req: Request<{}, {}, SigningCourseSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { user, course } = req.body;

        await CourseUserModel.create({ user, course });

        SuccessResponse(res, 201, { message: "course signed successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("user already has this course"));
        }
        next(err);
    }
};
