import repository from "../app/repository";
import {CommandSet} from "../lib/server/command/types";
import cmd from "../lib/server/command/cmd";
import {clients} from "../app/clients";
import {Request} from "express";
import {passwordService} from "../services/password-service";
import {IClient} from "../lib/client/client";
import {z} from "zod";

const fv = {
    user: {
        name: z.string().trim(),
        password: z.string().trim(),
        phone: z.string().trim().length(9).optional()
    }
};

@cmd.set("user")
@cmd.set.Client(clients.mobile, [1, 2])
@cmd.set.Authenticated(false)
export default class UserCmd implements CommandSet {

    @cmd("get")
    @cmd.Cache({ttl: 10, cttl: 30, user: true})
    @cmd.Client(clients.web, 3)
    async getUser_3() {
        return [
            "Hello",
            await repository.user.get(12)
        ];
    }

    @cmd("create")
    @cmd.Authenticated(true)
    @cmd.Validate(z.object({name: fv.user.name, password: fv.user.password, phone: fv.user.phone}))
    async createUser(args: { name: string, phone: string, password: string }) {
        return repository.user.insert({fullName: args.name, phone: args.phone, password: await passwordService.hash(args.password)});
    }

    @cmd("login")
    async userLogin(args: { name: string, password: string }, req: Request) {
        let res = await repository.user.auth(args.name, args.password);
        if (!res) return null;
        let client = req.context.get("client") as IClient;
        return client.jwt.encode(res.id);
    }
}
