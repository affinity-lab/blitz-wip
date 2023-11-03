import "reflect-metadata";
import express from "express";
import {extendRequest} from "./lib/extend-request";
import cors from "cors";
import {exceptionHandler} from "./lib/exeption-handling/exception-handler";
import "express-async-errors";
import cfg from "./services/config";
import logger from "./services/logger";
import {dbFactory} from "./db/db";
import {dataSourceStorage} from "./services/storage";


(async () => {
    dataSourceStorage["default"] = await dbFactory()
    let cmdResolver = require("./services/cmd-resolver").default;
    const app = express();
    app.use(extendRequest());
    app.use(cors<cors.CorsRequest>());
    app.use(express.json())
    app.post("/api/:app/:version/:cmd", async (req, res) => {
        const response = await cmdResolver.handle(
            req.params.app,
            parseInt(req.params.version),
            req.params.cmd,
            req
        );
        res.json(response);
    });
    app.get("/api/:app/:version/:cmd", async (req, res) => {
        const response = await cmdResolver.handle(
            req.params.app,
            parseInt(req.params.version),
            req.params.cmd,
            req
        );
        res.json(response);
    });
    app.use(exceptionHandler(logger));

    app.listen(cfg.serverPort, () => console.log(`Example app listening on port http://localhost:${cfg.serverPort}`));
})()
