import CommandResolver from "../lib/x-com-api/command-resolver";
import UserXCom from "../commands/user-x-com";
import PostXCom from "../commands/post-x-com";
import cacheFactory from "../services/cache-factory";
import {eventEmitter} from "../services/event-emitter";

const commandResolver = new CommandResolver(
	[UserXCom, PostXCom],
	{
		cacheReader: cacheFactory()?.getReader(),
		eventEmitter: eventEmitter
	}
);

export default commandResolver;
