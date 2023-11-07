import {and, eq, sql} from "drizzle-orm";
import MySqlRepository from "../lib/drizzle-repository/my-sql-repository";
import * as schema from "../app/schema";
import {passwordService} from "../services/password-service";
import {SchemaType} from "../app/schema-type";

export class UserRepository extends MySqlRepository<SchemaType, typeof schema.user> {

    private queries = {
        getByEmail: this.db.query.user.findFirst({where: eq(schema.user.email, sql.placeholder("email")), columns: {password: false}}).prepare(),
        auth: this.db.query.user.findFirst({where: and(eq(schema.user.email, sql.placeholder("email")), eq(schema.user.password, sql.placeholder("password"))), columns: {password: false}}).prepare(),
    };

	@MySqlRepository.store()
	@MySqlRepository.cache(30)
	getByEmail(email: string) {
		return this.queries.getByEmail.execute({email});
	}

	async auth(email: string, pw: string) {
		return this.queries.auth.execute({email, password: await passwordService.hash(pw)});
	}
}