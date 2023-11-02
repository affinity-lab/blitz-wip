import {and, eq, InferSelectModel, like, sql} from "drizzle-orm";
import MySqlRepository from "../lib/repository/my-sql-repository.js";
import schema from "../db/@schema.js";
import db from "../db/db.js";
import cacheFactory from "../services/cache-factory.js";
import {passwordService} from "../services/password-service.js";


class UserRepository extends MySqlRepository<typeof schema.user> {
	constructor() {
		super(
			schema.user,
			db,
			cacheFactory<InferSelectModel<typeof schema.user>>(10),
			cacheFactory<any>(30),
			["password"]
		);
		console.log("USER", Object.keys(schema.user))
	}

    private queries = {
        getByName: db.query.user.findFirst({where: like(schema.user.fullName, sql`${sql.placeholder("fullName")}`), columns: {password: false}}).prepare(),
        getByPhone: db.query.user.findFirst({where: eq(schema.user.phone, sql.placeholder("phone")), columns: {password: false}}).prepare(),
        auth: db.query.user.findFirst({where: and(eq(schema.user.fullName, sql.placeholder("name")), eq(schema.user.password, sql.placeholder("password"))), columns: {password: false}}).prepare(),
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

const repository = new UserRepository();

export default repository;

