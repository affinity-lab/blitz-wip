
export class Logger {
	constructor(private write: (message: string) => void, private minLogLevel = 0) {}

	request(message: string) {
		this.write(new Date().toISOString() + " [REQ] " + message);
	}

	/**
	 * @param message: log message.
	 * @param level: debug, info, warning, extended-error, fatal
	 */
	log(message: string, level: 0 | 1 | 2 | 3 | 4) {
		[this.debug, this.info, this.warning, this.error, this.fatal][level](message);
	}

	debug(message: string) {
		if(this.minLogLevel <= 0) this.write(new Date().toISOString() + " [DBG] " + message);
	}

	info(message: string) {
		if(this.minLogLevel <= 1) this.write(new Date().toISOString() + " [INF] " + message);
	}

	warning(message: string) {
		if(this.minLogLevel <= 2) this.write(new Date().toISOString() + " [WRN] " + message);
	}

	error(message: string) {
		if(this.minLogLevel <= 3) this.write(new Date().toISOString() + " [ERR] " + message);
	}

	fatal(message: string) {
		if(this.minLogLevel <= 4) this.write(new Date().toISOString() + " [FTL] " + message);
	}
}

