import "reflect-metadata";
import express from "express";
import cmdResolver from "./services/cmd-resolver.js";
import {extendRequest} from "./lib/extend-request.js";
import cors from "cors";

console.log(cmdResolver.resolvers);

const app = express();
app.use(extendRequest());
app.use(cors<cors.CorsRequest>());
app.use(express.json())
app.get("/api/:app/:version/:cmd", async (req, res) => {
    const response = await cmdResolver.handle(
        req.params.app,
        parseInt(req.params.version),
        req.params.cmd,
        req
    );
    res.json(response);
});

app.listen(3000, () => console.log(`Example app listening on port ${3000}`));