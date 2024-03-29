import {like, sql} from "drizzle-orm";
import {MySqlRepository} from "@affinity-lab/blitz";
import * as schema from "../app/schema";
import {SchemaType} from "../app/schema-type";

export class PostRepository extends MySqlRepository<SchemaType, typeof schema.post> {
	protected queries = {
		getPost: this.db.query.post.findFirst({where: like(schema.post.id, sql`${sql.placeholder("id")}`)}).prepare()
	};

	getPost(id: number) {
		return this.queries.getPost.execute({id});
	}
}