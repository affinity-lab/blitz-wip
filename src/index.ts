import "reflect-metadata";
import express, {Request} from "express";
import "express-async-errors";
import cfg from "./services/config";
import logger from "./services/logger";
import {eventEmitter} from "./services/event-emitter";
import {XCOM_API_EVENTS} from "@affinity-lab/x-com";
import {exceptionHandler, Jwt, XERROR} from "@affinity-lab/affinity-util";
import {imgEventListeners, storageFileServer, storageImgServer} from "@affinity-lab/blitz";
import {bootApp} from "./services/boot-sequence";

(async () => {
	let {resolver, app} = await bootApp();

	// region EventListeners
	eventEmitter.on(XCOM_API_EVENTS.REQUEST_ACCEPTED, (req: Request) => {
		logger.request(`${req.id}: (${req.context.get("request-type")}) ${req.url} - Authenticated: ${Jwt.getStringContent(req.context.get("authenticated"))}`);
	});
	eventEmitter.on(XERROR.ERROR, (error: any, req: Request) => {
		logger?.error(`${req.id}: ${error}`);
	});
	imgEventListeners(cfg.storage.img.path, eventEmitter);
	// endregion

	// region API Server
	app.post("/api/:app/:version/:cmd", async (req, res) => {
		const {app, version, cmd} = req.params;
		await resolver.handle(app, parseInt(version), cmd, req, res);
	});
	// endregion

	// region Static Server
	if (cfg.env.environment === "DEV") app.use("/api-client", express.static("etc/api"));
	app.use("/static", express.static(cfg.static.path, {maxAge: cfg.static.maxAge}));
	storageFileServer(app, "/files", cfg.storage.path, cfg.storage.maxAge);
	storageImgServer(app, "/img", cfg.storage.img.path, cfg.storage.path, cfg.storage.img.maxAge);
	// endregion

	app.use(exceptionHandler(eventEmitter));
	app.listen(cfg.serverPort, () => console.log(`Starting server: http://localhost:${cfg.serverPort}`));
})();