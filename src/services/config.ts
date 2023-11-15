import {Env} from "@affinity-lab/affinity-util";


class ConfigService {
	public readonly config;

	constructor(public env: Env) {
		const isTest: boolean = env.environment === "TEST";
		const isDev: boolean = env.environment === "DEV";
		const isProd: boolean = env.environment === "PROD";
		this.config = {
			env: env,
			environment: {name: env.environment, isTest, isDev, isProd},
			serverPort: env.int("PORT", 3000),
			storage: {
				path: env.sub("STORAGE").string("PATH"),
				tmp: env.sub("STORAGE").string("TMP")
			},
			database: {
				url: env.sub("DB").string("DATABASE_URL"),
				migration: env.sub("DB").string("MIGRATION_FOLDER"),
				schema: env.sub("DB").string("SCHEMA")
			},
			crypto: {
				passwordPepper: Buffer.from(env.string("PASSWORD_PEPPER"))
			},
			redis: {
				url: env.string("REDIS_URL", ""),
				password: env.string("REDIS_PASSWORD", "temp")
			}
		};
	};
}

const env: Env = new Env(
	{...process.env, ...Env.loadEnvVars("env.ini")},
	{key: "ENVIRONMENT", default: "PROD"},
	{"PROD": undefined, "DEV": "DEV", "TEST": "TEST"}
);


export const configService: ConfigService = new ConfigService(env);

const cfg = configService.config;
export default cfg;
