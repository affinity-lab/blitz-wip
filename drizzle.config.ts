import type {Config} from "drizzle-kit";
import cfg from "./src/services/config";

export default {
    verbose: true,
    schema: "./src/app/schema.ts",
    out: cfg.database.migration,
    driver: "mysql2",
    dbCredentials: {
        uri: cfg.database.url
    }
} satisfies Config;