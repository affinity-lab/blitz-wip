import {STORAGE} from "./storage";
import {drizzle} from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import cfg from "./config";
import * as schema from "../app/schema";
import {migrate} from "drizzle-orm/mysql2/migrator";
import {apiGen, CommandResolver, extendExpressRequest} from "@affinity-lab/x-com";
import path from "path";
import process from "process";
import express from "express";
import cors from "cors";
import multer from "multer";

export async function bootSequence() {

	process.stdout.write(`\n[Booting BlitzCom]\n`);

	process.stdout.write(`Connecting to database...`);
	STORAGE["db"] = drizzle(await mysql.createConnection(cfg.database.url), {mode: "default", schema, logger: cfg.database.log});
	process.stdout.write(`done\n`);

	process.stdout.write(`Running migrations...`);
	await migrate(STORAGE["db"], {migrationsFolder: cfg.database.migration});
	process.stdout.write(`done\n`);

	process.stdout.write(`Loading resolvers...`);
	const resolver: CommandResolver = require(path.join(process.cwd(), "src/app/command-resolver")).default;
	process.stdout.write(`done\n`);

	return {resolver};
}

export async function bootGenerateApi() {
	const {resolver} = await bootSequence();
	process.stdout.write(`Generating api client...`);
	apiGen(path.join(process.cwd(), "src/**/*.ts"), resolver, "etc/api");
	process.stdout.write(`done\n`);
}

export async function bootApp() {
	const {resolver} = await bootSequence();
	const app = express();
	app.use(extendExpressRequest, cors<cors.CorsRequest>(), express.json(), multer().any());
	return {app, resolver};
}

export async function bootScheduler() {
	const {resolver} = await bootSequence();
	const app = express();
	app.use(extendExpressRequest, cors<cors.CorsRequest>(), express.json(), multer().any());
}
