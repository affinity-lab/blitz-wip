import "reflect-metadata";
import express, {Request} from "express";
import {extendExpressRequest} from "./lib/extend-express-request";
import cors from "cors";
import {exceptionHandler} from "./lib/exception-handler";
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
import {XComApiEvents} from "./lib/x-com-api/events";
import {Jwt} from "./lib/jwt";

/* Wrap the whole process into a async function */
(async () => {

	eventEmitter.on(
		XComApiEvents.RequestAccepted,
		(req: Request) => logger.request(`${req.id}: (${req.context.get("request-type")}) ${req.url} - Authenticated: ${Jwt.getStringContent(req.context.get("authenticated"))}`)
	);

	/* Create a database connection, and store the reference in the STORAGE object */
	STORAGE["db"] = drizzle(await mysql.createConnection(cfg.database.url), {mode: "default", schema, logger: true});

	/* Run database migrations */
	await migrate(STORAGE["db"], {migrationsFolder: cfg.database.migration});

	const app = express();
	app.use(extendExpressRequest); // extend request with custom properties
	app.use(cors<cors.CorsRequest>()); // enable cors
	app.use(express.json()); // enable json
	app.use(multer().any()); // enable json
	/* Add /api endpoint with the commandResolver */
	let commandResolver = require("./app/command-resolver").default;
	app.post("/api/:app/:version/:cmd", async (req, res) => {
		await commandResolver.handle(
			req.params.app,
			parseInt(req.params.version),
			req.params.cmd,
			req,
			res
		);
	});
	/* Add exception handler to catch all exceptions*/
	app.use(exceptionHandler(logger));
	/* Start the x-com-api */
	app.listen(cfg.serverPort, () => console.log(`Example app listening on port http://localhost:${cfg.serverPort}`));
})();