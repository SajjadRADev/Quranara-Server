import express from "express";
import cookieParser from "cookie-parser";

import globalErrorHandler from "./middlewares/globalErrorHandler";

import authRouter from "@/routes/v1/auth";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use(globalErrorHandler);

export default app;
