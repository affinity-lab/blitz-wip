import type {Config} from "drizzle-kit";
import cfg from "./dist/services/config";

export default {
    verbose: true,
    schema: "./src/db/schemas/*",
    out: cfg.database.migration,
    driver: "mysql2",
    dbCredentials: {
        connectionString: cfg.database.url
    }
} satisfies Config;