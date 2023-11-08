import {like, sql} from "drizzle-orm";
import MySqlRepository from "../lib/drizzle-repository/my-sql-repository";
import * as schema from "../app/schema";
import {SchemaType} from "../app/schema-type";
import AttachmentEntity from "../lib/attachment/attachment-entity";
import {attachmentHandler} from "../app/attachment-handler";
import AttachmentCollection from "../lib/attachment/attachment-collection";
import repository from "../app/repository";


export class PostRepository extends MySqlRepository<SchemaType, typeof schema.post> {
	protected queries = {
		getPost: this.db.query.post.findFirst({where: like(schema.post.id, sql`${sql.placeholder("id")}`), with: {author: {columns: {password: false}}}}).prepare()
	};

	getPost(id: number) {
		return this.queries.getPost.execute({id});
	}

}

const attachments = {
	post: new AttachmentEntity(attachmentHandler, schema.post, {
		avatar: new AttachmentCollection("helo")
	})
};

repository.post.beforeDelete((id:number)=>attachments.post.purge(id))

// export const postAttachments = new AttachmentEntity(attachmentHandler, schema.post, {
// 	avatar: new AttachmentCollection("helo")
// });
//
// (async () => {
//
// 	repository.post.attachments.$.avatar.
// 	//
// 	// const posts = await repository.post.get([1, 2, 3]);
// 	// await postAttachments.with(posts, "files", "avatar");
// 	// await postAttachments.$.avatar.with(posts, "file");
// 	// await postAttachments.$.avatar.add(1, "file");
// 	// await postAttachments.$.avatar.delete(1, "file");
// 	// await postAttachments.$.avatar.rename(1, "file.jpg", "fasza.jpg");
// 	// await postAttachments.purge(1);
// 	// await postAttachments.get(1);
// 	return 0;
// })();