import "reflect-metadata";
import express, {Request} from "express";
import cors from "cors";
import "express-async-errors";
import cfg from "./services/config";
import logger from "./services/logger";
import {STORAGE} from "./services/storage";
import mysql from "mysql2/promise";
import {drizzle} from "drizzle-orm/mysql2";
import * as schema from "./app/schema";
import {migrate} from "drizzle-orm/mysql2/migrator";
import multer from "multer";
import {eventEmitter} from "./services/event-emitter";
import {apiGen, extendExpressRequest, XCOM_API_EVENTS} from "@affinity-lab/x-com";
import {exceptionHandler, Jwt, XERROR} from "@affinity-lab/affinity-util";
import {imgEventListeners, storageFileServer, storageImgServer} from "@affinity-lab/blitz";
import path from "path";
import * as process from "process";

/* Wrap the whole process into a async function */
(async () => {
	eventEmitter.on(
		XCOM_API_EVENTS.REQUEST_ACCEPTED,
		(req: Request) => logger.request(`${req.id}: (${req.context.get("request-type")}) ${req.url} - Authenticated: ${Jwt.getStringContent(req.context.get("authenticated"))}`)
	);
	eventEmitter.on(
		XERROR.ERROR,
		(error: any, req: Request) => logger?.error(`${req.id}: ${error}`)
	);
	imgEventListeners(cfg.storage.img.path, eventEmitter);

	/* Create a database connection, and store the reference in the STORAGE object */
	STORAGE["db"] = drizzle(await mysql.createConnection(cfg.database.url), {mode: "default", schema, logger: true});

	/* Run database migrations */
	await migrate(STORAGE["db"], {migrationsFolder: cfg.database.migration});

	const app = express();
	app.use(extendExpressRequest); // extend request with custom properties
	app.use(cors<cors.CorsRequest>()); // enable cors
	app.use(express.json()); // enable json
	app.use(multer().any()); // enable json

	const resolver = require("./app/command-resolver").default;

	/* Add /api endpoint with the commandResolver */
	app.post("/api/:app/:version/:cmd", async (req, res) => {
		const {app, version, cmd} = req.params;
		await resolver.handle(app, parseInt(version), cmd, req, res);
	});

	/* Generate api clients*/
	if(cfg.env.environment === "DEV"){
		apiGen(path.join(process.cwd(), "src/**/*.ts"), resolver, "etc/api");
		app.use("/api-client", express.static("etc/api"));
	}
	/* Add static file server*/
	app.use("/static", express.static(cfg.static.path, {maxAge: cfg.static.maxAge}));
	/* Add storage file server */
	storageFileServer(app, "/files", cfg.storage.path, cfg.storage.maxAge);
	/* Add storage img server */
	storageImgServer(app, "/img", cfg.storage.img.path, cfg.storage.path, cfg.storage.img.maxAge);

	/* Add exception handler to catch all exceptions*/
	app.use(exceptionHandler(eventEmitter));

	/* Start the server */
	app.listen(cfg.serverPort, () => console.log(`Example app listening on port http://localhost:${cfg.serverPort}`));
})();