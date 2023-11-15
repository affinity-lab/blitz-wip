import repository from "../app/repository";
import {Client, clients} from "../app/clients";
import {Request} from "express";
import {Jwt} from "@affinity-lab/affinity-util";
import {Command, CommandAuthenticated, XCom, XComAuthenticated, XComClient} from "@affinity-lab/x-com";

@XCom("post")
@XComClient(clients.mobile, [1, 2])
@XComAuthenticated(false)
export default class PostXCom {
	@Command()
	@CommandAuthenticated()
	async get(args: { id: number }, req: Request) {
		await guard.auth(req);
		let post = await repository.post.get(args.id);
		let user = await repository.user.get(post!.authorId!);
		return {post, author: user};

		// return blitz.post.getPost(args.id);
	}
}


const guard = {
	auth: async (req: Request) => {
		let userId: number | undefined;
		try {
			userId = ((req.context.get("client") as Client).jwt as Jwt<number>).decode(req.context.get("authenticated"));
		} catch (e) {
			throw Error("403-token extended-error");
		}
		if (userId === undefined) throw Error("401-user not exists");
		if (!await repository.user.get(userId)) throw Error("401-user not exists");
	}
};