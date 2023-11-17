import {and, eq, sql} from "drizzle-orm";
import {MySqlRepository} from "@affinity-lab/blitz";
import * as schema from "../app/schema";
import {SchemaType} from "../app/schema-type";


export class VerificationRepository extends MySqlRepository<SchemaType, typeof schema.verification> {
	protected queries = {
		verify: this.db.query.verification.findFirst({
			where:
				and(eq(schema.verification.email, sql.placeholder("email")),
					eq(schema.verification.code, sql.placeholder("code")))
		}).prepare()
	};

	async verify(code: string, email: string): Promise<boolean> {
		const r = await this.queries.verify.execute({email, code});
		return !!r;
	}
}

