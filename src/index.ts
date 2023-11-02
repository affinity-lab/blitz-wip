import "reflect-metadata";
import express from "express";
import cmdResolver from "./services/cmd-resolver.js";
import {extendRequest} from "./lib/extend-request.js";
import cors from "cors";
import {exceptionHandler} from "./lib/exception-handler.js";
import "express-async-errors";

console.log(cmdResolver.resolvers);

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
app.use(exceptionHandler());

app.listen(3000, () => console.log(`Example app listening on port ${3000}`));