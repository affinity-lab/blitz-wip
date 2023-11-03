import repository from "../repositories/@repository.js";
import {CommandSet} from "../lib/command/types.js";
import cmd from "../lib/command/cmd.js";
import {clients} from "../app/clients.js";
import {Request} from "express";
import {passwordService} from "../services/password-service.js";
import {IClient} from "../lib/client/client.js";
import {z} from "zod";

const fv = {
    user: {
        name: z.string({required_error: "Name is required", invalid_type_error: "Name must be a string"}).trim(),
        password: z.string({required_error: "Password is required", invalid_type_error: "Password must be a string"}),
        phone: z.string({required_error: "Phone is required", invalid_type_error: "Phone must be a string"}).trim().regex(/^[0-9]{9}$/g, {message: "Phone must be exactly 9 numbers!"})
    }
}

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
    @cmd.Validate(z.object({name: fv.user.name, password: fv.user.password, phone: fv.user.phone}))
    async createUser(args: {name: string, phone: string, password: string}) {
        return repository.user.insert({fullName: args.name, phone: args.phone, password: await passwordService.hash(args.password)})
    }

    @cmd("login")
    async userLogin(args: {name: string, password: string}, req: Request) {
        let res = await repository.user.auth(args.name, args.password);
        if(!res) return null;
        let client = req.context.get("client") as IClient
        return client.jwt.encode(res.id)
    }
}
