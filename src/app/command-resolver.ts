import cacheFactory from "../services/cache-factory";
import {eventEmitter} from "../services/event-emitter";
import {CommandResolver} from "@affinity-lab/x-com";
import {CommandSet} from "@affinity-lab/x-com/src/types";
import {loadModuleDefaultExports} from "@affinity-lab/affinity-util";
import * as process from "process";


const commandResolver = new CommandResolver(
	loadModuleDefaultExports<CommandSet>(process.cwd() + "/src/commands/"),
	{
		cacheReader: cacheFactory()?.getReader(),
		eventEmitter: eventEmitter
	}
);

export default commandResolver;
