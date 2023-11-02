import {eq, InferSelectModel, like, sql} from "drizzle-orm";
import MySqlRepository from "../lib/repository/my-sql-repository.js";
import schema from "../db/@schema.js";
import db from "../db/db.js";
import cacheFactory from "../services/cache-factory.js";


class UserRepository extends MySqlRepository<typeof schema.user> {
	constructor() {
		super(
			schema.user,
			db,
			cacheFactory<InferSelectModel<typeof schema.user>>(10),
			cacheFactory<any>(30)
		);
	}

    private queries = {
        getByName: db.query.user.findFirst({where: like(schema.user.fullName, sql`${sql.placeholder("fullName")}`)}).prepare(),
        getByPhone: db.query.user.findFirst({where: eq(schema.user.phone, sql.placeholder("phone"))}).prepare()
    };

	@MySqlRepository.store()
	getByName(name: string) { return this.queries.getByName.execute({fullName: "%" + name + "%"});}

	@MySqlRepository.store()
	@MySqlRepository.cache(30)
	getByPhone(phone: string) { return this.queries.getByPhone.execute({phone});}
}

const repository = new UserRepository();

export default repository;

