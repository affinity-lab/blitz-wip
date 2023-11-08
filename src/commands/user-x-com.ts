import repository from "../app/repository";
import {Command, CommandCache, CommandClient} from "../lib/x-com-api/x-com-command";
import {XCom, XComClient} from "../lib/x-com-api/x-com-api";
import {Client, clients} from "../app/clients";
import {Request} from "express";
import {passwordService} from "../services/password-service";
import crypto from "crypto";
import {appError} from "../app/errors";
import {CommandSanitize} from "../lib/x-com-saintize/command-sanitize";
import {CommandValidate} from "../lib/x-com-validate-zod/command-validate";
import {z} from "zod";

const fv = {
	user: {
		name: z.string().trim(),
		password: z.string().trim(),
		phone: z.string().trim().length(9).optional()
	}
};

@XCom("user")
export default class UserXCom {

	@Command()
	@CommandClient(clients.mobile, 1)
	async doesExist(args: { email: string }): Promise<boolean> {
		return repository.user.getByEmail(args.email).then(r => !!r);
	}

	@Command("doesExists")
	@CommandClient(clients.mobile, 2)
	async doesExist2(args: { email: string }): Promise<boolean> {
		return repository.user.getByEmail(args.email).then(r => !!r);
	}

	@Command("create")
	@CommandSanitize((args: Record<string, any>) => {
		args.valami = "hello";
		return args;
	})
	@CommandValidate(z.object({name: z.string().length(3)}))
	@CommandClient(clients.mobile, [1,2])
	async createUser(args: { name: string, email: string, password: string, verificationCode: string }) {
		if (await repository.verification.verify(args.verificationCode, args.email)) {
			return repository.user.insert({name: args.name, email: args.email, password: await passwordService.hash(args.password)});
		}
		throw appError.auth.verificationCode();
	}

	@Command()
	@CommandClient(clients.mobile, 1)
	async createVerification(args: { email: string }): Promise<boolean> {
		let code = crypto.randomUUID();
		await repository.verification.insert({email: args.email, code});
		// send mail
		console.log(code);
		return true;
	}

	@Command()
	@CommandClient(clients.mobile, 1)
	async login(args: { name: string, password: string }, req: Request): Promise<undefined | string> {
		let res = await repository.user.auth(args.name, args.password);
		if (!res) return undefined;
		let client = req.context.get("client") as Client;
		return client.jwt.encode(res.id);
	}
}
