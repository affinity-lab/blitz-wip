import {like, sql} from "drizzle-orm";
import MySqlRepository from "../lib/drizzle-repository/my-sql-repository";
import * as schema from "../app/schema";
import {SchemaType} from "../app/schema-type";
import AttachmentHandler from "../lib/attachment-handler";


export class PostRepository extends MySqlRepository<SchemaType, typeof schema.post> {
    protected queries = {
        getPost: this.db.query.post.findFirst({where: like(schema.post.id, sql`${sql.placeholder("id")}`), with: {author: {columns: {password: false}}}}).prepare()
    };

    public readonly attachments = {
        avatar: new AttachmentHandler(),
        profile: new AttachmentHandler(),
    }

    getPost(id: number) {
        return this.queries.getPost.execute({id});
    }
}

