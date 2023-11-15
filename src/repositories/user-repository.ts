import {and, eq, sql} from "drizzle-orm";
import * as schema from "../app/schema";
import {passwordService} from "../services/password-service";
import {SchemaType} from "../app/schema-type";
import {DocumentCollection, ImageCollection, MySqlRepository} from "@affinity-lab/blitz";

export class UserRepository extends MySqlRepository<SchemaType, typeof schema.user> {

	public excludedFields = ["password"];

	private queries = {
		getByEmail: this.db.query.user.findFirst({where: eq(schema.user.email, sql.placeholder("email")), columns: {password: false}}).prepare(),
		auth: this.db.query.user.findFirst({where: and(eq(schema.user.email, sql.placeholder("email")), eq(schema.user.password, sql.placeholder("password"))), columns: {password: false}}).prepare()
	};

	@MySqlRepository.store()
	@MySqlRepository.cache(30)
	getByEmail(email: string) {
		return this.queries.getByEmail.execute({email});
	}

	async auth(email: string, pw: string) {
		return this.queries.auth.execute({email, password: await passwordService.hash(pw)});
	}

	images: ImageCollection = ImageCollection.factory(this, "images", {limit: 3, size: 1024 * 1024});
	documents = DocumentCollection.factory(this, "documents", {limit: 3, size: 1024 * 1024});
}
