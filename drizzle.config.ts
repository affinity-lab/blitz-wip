import type {Config} from "drizzle-kit";
import cfg from "./src/services/config";

export default {
    verbose: true,
    schema: "./src/db/schema.ts",
    out: cfg.database.migration,
    driver: "mysql2",
    dbCredentials: {
        connectionString: cfg.database.url
    }
} satisfies Config;