import {and, eq, sql} from "drizzle-orm";
import MySqlRepository from "../lib/repository/my-sql-repository";
import * as schema from "../app/schema";
import {SchemaType} from "../app/schema-type";


export class VerificationRepository extends MySqlRepository<SchemaType, typeof schema.verification> {
	protected queries = {
		verify: this.db.query.verification.findFirst({
			where:
				and(eq(schema.verification.email, sql.placeholder("email")),
				eq(schema.verification.code, sql.placeholder("code"))),
		}).prepare(),
	};

	verify(code: string, email: string): Promise<boolean> {
		return this.queries.verify.execute({email, code}).then(r=>!!r)
	}
}

