import dotenv from "dotenv";

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
    dotenv.config();
}

import "@/config/cronJobs";
import http from "node:http";
import app from "@/app";
import connectToDatabase from "@/config/database";

const startServer = async () => {
    const port = process.env.PORT;

    const httpServer = http.createServer(app);

    httpServer.listen(port, () => {
        console.log(`Server Running In ${isProduction ? "Production" : "Development"} Mode On Port ${port}`);
    });
};

const run = async () => {
    await connectToDatabase();
    await startServer();
};

run();
