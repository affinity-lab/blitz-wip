import repository from "../repositories/@repository.js";
import {CommandSet} from "../lib/command/types.js";
import cmd from "../lib/command/cmd.js";
import {clients} from "../app/clients.js";
import {Request} from "express";
import {IClient} from "../lib/client/client.js";

@cmd.set("post")
@cmd.set.Client(clients.mobile, [1, 2])
@cmd.set.Authenticated(false)
export default class PostCmd implements CommandSet {
	@cmd()
	@cmd.Authenticated()
	async get(args: {id: number}, req: Request) {
		await guard.auth(req);
		let post = await repository.post.get(args.id)
		let user = await repository.user.get(post!.authorId!)
		return {post, author: user}

		// return repository.post.getPost(args.id);
	}
}


const guard = {
	auth : async (req: Request) => {
		let userId;
		try {
			userId = (req.context.get("client") as IClient).jwt.decode(req.context.get("authenticated"));
		} catch (e) {
			throw Error("403-token error")
		}
		if(!await repository.user.get(userId)) throw Error("401-user not exists")
	}
}