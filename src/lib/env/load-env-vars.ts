import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import {parse} from "ini";


export function loadEnvVars(file: string = ".env"): Record<string, any> {
	const p: path.ParsedPath = path.parse(file);
	const fileContents: string = fs.readFileSync(file).toString();
	return p.ext === ".ini"
		? parse(fileContents)
		: dotenv.parse(fileContents);
}
