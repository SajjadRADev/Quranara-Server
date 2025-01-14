import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "@/utils/exceptions";

const secure = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const origin = req.headers.origin;

        if (origin !== process.env.FRONTEND_URL) {
            throw new ForbiddenException("you don't have authorization to access this server");
        }

        const secret = req.headers["x-quranara-secret"];

        if (secret !== process.env.QURANARA_SECRET) {
            throw new ForbiddenException("you don't have authorization to access this server");
        }

        next();
    } catch (err) {
        next(err);
    }
};

export default secure;
