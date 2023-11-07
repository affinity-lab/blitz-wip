import repository from "../app/repository";
import {Command, CommandAuthenticated, CommandSet, CommandSetAuthenticated, CommandSetClient} from "../lib/express-command-api/command";
import {Client, clients} from "../app/clients";
import {Request} from "express";
import {Jwt} from "../lib/jwt";

@CommandSet("post")
@CommandSetClient(clients.mobile, [1, 2])
@CommandSetAuthenticated(false)

export default class PostCmd {
	@Command()
	@CommandAuthenticated()
	async get(args: { id: number }, req: Request) {
		await guard.auth(req);
		let post = await repository.post.get(args.id);
		let user = await repository.user.get(post!.authorId!);
		return {post, author: user};

		// return drizzle-repository.post.getPost(args.id);
	}
}


const guard = {
	auth: async (req: Request) => {
		let userId: number | undefined;
		try {
			userId = ((req.context.get("client") as Client).jwt as Jwt<number>).decode(req.context.get("authenticated"));
		} catch (e) {
			throw Error("403-token error");
		}
		if (userId === undefined) throw Error("401-user not exists");
		if (!await repository.user.get(userId)) throw Error("401-user not exists");
	}
};