import {InferSelectModel, like, sql} from "drizzle-orm";
import MySqlRepository from "../lib/repository/my-sql-repository.js";
import schema from "../db/@schema.js";
import db from "../db/db.js";
import cacheFactory from "../services/cache-factory.js";


class PostRepository extends MySqlRepository<typeof schema.post> {
	constructor() {
		super(
			schema.post,
			db,
			cacheFactory<InferSelectModel<typeof schema.post>>(10),
			cacheFactory<any>(30)
		);
	}

	private queries = {
		getPost: this.db.query.post.findFirst({where: like(schema.post.id, sql`${sql.placeholder("id")}`), with: {author: {columns: {password: false}}}}).prepare(),
	};

	getPost(id: number) {
		return this.queries.getPost.execute({id});
	}
}

const repository = new PostRepository();

export default repository;

