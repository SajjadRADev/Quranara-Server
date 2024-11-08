import express from "express";
import { getAll, create, search, getOne, update, getRelated, getComments, like, dislike, save, unsave, shown, unshown } from "@/controllers/v1/blog";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateBlogSchema, CreateBlogQuerySchema, GetAllBlogsQuerySchema, SearchBlogsQuerySchame } from "@/validators/blog";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(validator("query", GetAllBlogsQuerySchema), getAll).post(auth, roleGuard(ROLES.MANAGER), validator("query", CreateBlogQuerySchema), validator("body", CreateBlogSchema), create);
router.get("/search", validator("query", SearchBlogsQuerySchame), search);
router.route("/:id").put(auth, roleGuard(ROLES.MANAGER), validator("body", CreateBlogSchema), update);
router.get("/:slug", getOne);
router.get("/:slug/related", getRelated);
router.get("/:slug/comments", validator("query", PaginationQuerySchema), getComments);
router.post("/:id/like", auth, like);
router.delete("/:id/dislike", auth, dislike);
router.post("/:id/save", auth, save);
router.delete("/:id/unsave", auth, unsave);
router.patch("/:id/shown", auth, roleGuard(ROLES.MANAGER), shown);
router.patch("/:id/unshown", auth, roleGuard(ROLES.MANAGER), unshown);

export default router;
