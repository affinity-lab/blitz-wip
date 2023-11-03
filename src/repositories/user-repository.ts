import {and, eq, InferSelectModel, like, sql} from "drizzle-orm";
import MySqlRepository from "../lib/repository/my-sql-repository";
import * as schema from "../app/schema";
import {passwordService} from "../services/password-service";
import {SchemaType} from "../app/schema-type";

export class UserRepository extends MySqlRepository<SchemaType, typeof schema.user> {

    private queries = {
        getByName: this.db.query.user.findFirst({where: like(schema.user.fullName, sql`${sql.placeholder("fullName")}`), columns: {password: false}}).prepare(),
        getByPhone: this.db.query.user.findFirst({where: eq(schema.user.phone, sql.placeholder("phone")), columns: {password: false}}).prepare(),
        auth: this.db.query.user.findFirst({where: and(eq(schema.user.fullName, sql.placeholder("name")), eq(schema.user.password, sql.placeholder("password"))), columns: {password: false}}).prepare(),
    };

	@MySqlRepository.store()
	getByName(name: string) {return this.queries.getByName.execute({fullName: "%" + name + "%"});}

	@MySqlRepository.store()
	@MySqlRepository.cache(30)
	getByPhone(phone: string) {
		return this.queries.getByPhone.execute({phone});
	}

	async auth(name: string, pw: string) {
		return this.queries.auth.execute({name, password: await passwordService.hash(pw)});
	}
}