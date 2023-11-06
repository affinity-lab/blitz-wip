import repository from "../app/repository";
import {CommandSet} from "../lib/server/command/types";
import cmd from "../lib/server/command/cmd";
import {clients} from "../app/clients";
import {Request} from "express";
import {passwordService} from "../services/password-service";
import {IClient} from "../lib/client/client";
import crypto from "crypto";
import {appError} from "../app/errors";

// const fv = {
//     user: {
//         name: z.string().trim(),
//         password: z.string().trim(),
//         phone: z.string().trim().length(9).optional()
//     }
// };

@cmd.set("user")
@cmd.set.Client(clients.mobile, 1)
export default class UserCmd implements CommandSet {

    @cmd("doesExist")
    async getByEmail(args: {email: string}): Promise<boolean> {
        return repository.user.getByEmail(args.email).then(r=>!!r)
    }

    @cmd("create")
    async createUser(args: { name: string, email: string, password: string, verificationCode: string}) {
        if (await repository.verification.verify(args.verificationCode, args.email)) {
            return repository.user.insert({name: args.name, email: args.email, password: await passwordService.hash(args.password)});
        }
        throw appError.auth.verificationCode();
    }

    @cmd()
    async createVerification(args: {email: string}): Promise<boolean> {
        let code = crypto.randomUUID()
        await repository.verification.insert({email: args.email, code})
        // send mail
        console.log(code);
        return true;
    }

    @cmd()
    async login(args: { name: string, password: string }, req: Request): Promise<undefined | string> {
        let res = await repository.user.auth(args.name, args.password);
        if (!res) return undefined;
        let client = req.context.get("client") as IClient;
        return client.jwt.encode(res.id);
    }
}
