import repository from "../repositories/@repository.js";
import {CommandSet} from "../lib/command/types.js";
import cmd from "../lib/command/cmd.js";
import {clients} from "../app/clients.js";
import {Request} from "express";

@cmd.set("user")
@cmd.set.Client(clients.mobile, [1, 2])
@cmd.set.Authenticated()
export default class UserCmd implements CommandSet {
    @cmd("get")
    @cmd.Cache({ttl: 10})
    @cmd.Authenticated(false)
    @cmd.Client(clients.web)
    async getUser_1(args: { id: number }, req: Request) {
        return [
            "Hello",
            await repository.user.get([1, 2, 3, 4, 5, 6]),
            await repository.user.get(7),
            await repository.user.get(8),
            await repository.user.get(9),
            await repository.user.get(10)
        ];
    }
}
