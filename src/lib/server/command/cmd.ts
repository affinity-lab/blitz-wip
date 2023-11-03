import {CacheDef, CommandSet} from "./types";
import {Client} from "../../client/client";
import {z} from "zod";

type Constructor = (new () => Object) | Function;

export class CmdConfig {
    alias: string;
    cache?: CacheDef;
    clients: Array<{ client: Client, version: number | Array<number>, cache: boolean | CacheDef }> = [];
    authenticated?: boolean;
    validator?: z.ZodObject<any>

    constructor(public func: string) {
        this.alias = func;
    }
}

export class CmdSetConfig {
    alias: string;
    clients: Array<{ client: Client, version: number | Array<number> }> = [];
    authenticated: boolean = false;

    cmds: Record<string, CmdConfig> = {};

    constructor(public target: Constructor) {
        this.alias = target.name;
    }

    private static get(target: Constructor): CmdSetConfig {
        if (Reflect.has(target, "cmd-set")) {
            return Reflect.get(target, "cmd-set");
        }
        return new CmdSetConfig(target);
    };

    static set(target: Constructor, callback: (cmdSet: CmdSetConfig) => CmdSetConfig) {
        const value = callback(this.get(target));
        Reflect.set(target, "cmd-set", value);
    }

    getCmd(name: string | symbol) {
        return this.cmds.hasOwnProperty(name) ? this.cmds[name.toString()] : this.cmds[name.toString()] = new CmdConfig(name.toString());
    }

    static getConfigsFromCommandSets(commands: CommandSet[]) {
        return commands.map(command => Reflect.get(command, "cmd-set"));
    }
}


/* - - -- - - - - - -- */
// removed unused descriptors

const cmd = (alias?: string): MethodDecorator => {
    return function (target, propertyKey) {
        CmdSetConfig.set(target.constructor, cmdSet => {
            const cmd = cmdSet.getCmd(propertyKey);
            if (alias) cmd.alias = alias;
            return cmdSet;
        });
    };
};

cmd.Validate = function validateArgs(ZodPattern: z.ZodObject<any>): MethodDecorator {
    return function (target: object, propertyKey: string | symbol) {
        CmdSetConfig.set(target.constructor, cmdSet => {
            const cmd = cmdSet.getCmd(propertyKey);
            cmd.validator = ZodPattern;
            return cmdSet;
        })
    };
}

cmd.Cache = (cache: CacheDef): MethodDecorator => {
    return function (target, propertyKey) {
        CmdSetConfig.set(target.constructor, cmdSet => {
            const cmd = cmdSet.getCmd(propertyKey);
            cmd.cache = cache;
            return cmdSet;
        });
    };
};
cmd.Authenticated = (status: boolean = true): MethodDecorator => {
    return function (target, propertyKey) {
        CmdSetConfig.set(target.constructor, cmdSet => {
            const cmd = cmdSet.getCmd(propertyKey);
            cmd.authenticated = status;
            return cmdSet;
        });
    };
};
cmd.Client = (client: Client, version: number | Array<number> = 1, cache: boolean | CacheDef = true): MethodDecorator => {
    return function (target, propertyKey) {
        CmdSetConfig.set(target.constructor, cmdSet => {
            const cmd = cmdSet.getCmd(propertyKey);
            cmd.clients.push({client, version, cache});
            return cmdSet;
        });
    };
};


const cmdset = (alias?: string): ClassDecorator => {
    return function (target) {
        CmdSetConfig.set(target, cmdSet => {
            if (alias) cmdSet.alias = alias;
            return cmdSet;
        });
    };
};
cmdset.Client = (client: Client, version: number | Array<number> = 1): ClassDecorator => {
    return function (target) {
        CmdSetConfig.set(target, cmdSet => {
            cmdSet.clients.push({client, version});
            return cmdSet;
        });
    };
};
cmdset.Authenticated = (status: boolean = true): ClassDecorator => {
    return function (target) {
        CmdSetConfig.set(target, cmdSet => {
            cmdSet.authenticated = status;
            return cmdSet;
        });
    };
};



cmd.set = cmdset;
export default cmd;