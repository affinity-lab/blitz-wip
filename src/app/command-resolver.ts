import UserXCom from "../commands/user-x-com";
import PostXCom from "../commands/post-x-com";
import cacheFactory from "../services/cache-factory";
import {eventEmitter} from "../services/event-emitter";
import {CommandResolver} from "@affinity-lab/x-com";

const commandResolver = new CommandResolver(
	[UserXCom, PostXCom],
	{
		cacheReader: cacheFactory()?.getReader(),
		eventEmitter: eventEmitter
	}
);

export default commandResolver;
