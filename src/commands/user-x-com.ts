import repository from "../app/repository";
import {Client, clients} from "../app/clients";
import {Request} from "express";
import {passwordService} from "../services/password-service";
import crypto from "crypto";
import {appError} from "../app/errors";
import {z} from "zod";
import {Command, CommandClient, CommandPreprocessArgs, CommandValidateZod, Files, XCom} from "@affinity-lab/x-com";
import * as console from "console";
import {tmpFile} from "../services/tmp-file";

const fv = {
	user: {
		name: z.string().trim().min(5),
		password: z.string().trim(),
		phone: z.string().trim().length(9).optional()
	}
};

type bool = boolean;

@XCom("user")
export default class UserXCom {

	@Command()
	@CommandClient(clients.mobile, 1)
	async doesExist(args: { email: string }): Promise<bool> {
		return repository.user.getByEmail(args.email).then((r: any) => !!r);
	}


	@Command("upload")
	@CommandClient(clients.mobile, 1)
	@CommandValidateZod(z.object({id: z.number({coerce: true})}))
	async upload(args: { id: number }, req: Request, files: Files): Promise<void> {
		const file = tmpFile(files["file"][0]);
		await repository.user.images.add(args.id, file);
	}

	@Command("doesExists")
	@CommandClient(clients.mobile, 2)
	async get(args: { id: number }) {
		return repository.user.get(args.id);
	}

	@Command("create")
	@CommandPreprocessArgs((args: Record<string, any>) => {
		args.valami = "hello";
		return args;
	})
	@CommandValidateZod(z.object({name: z.string().length(3)}))
	@CommandClient(clients.mobile, [1, 2])
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
