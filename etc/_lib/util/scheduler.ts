import {CronJob} from "cron";
import * as fs from "fs";
import fg from "fast-glob";


export class Scheduler {
	static make(interval: string, job: () => void, random?: number): Descriptor {return {interval, job, random};};

	private jobs: Array<CronJob> = [];

	constructor(private path?: string) {
		if (this.path !== undefined) this.path = fs.realpathSync(this.path).replaceAll("\\", "/");
	};

	add(interval: string, job: () => void, random?: number) {
		if (random !== undefined) {
			this.jobs.push(new CronJob(interval, () => {
				const rnd = Math.floor(Math.random() * random * 1000);
				setTimeout(() => job(), rnd);
			}));
		} else {
			this.jobs.push(new CronJob(interval, job));
		}
		return true;
	};

	start(delay?: number) {
		if (delay === undefined) {
			this.load();
			this.jobs.map(job => job.start());
			console.log(`⏰  Job Scheduler started (${this.jobs.length} job${this.jobs.length !== 1 ? "s" : ""}).`);
		} else {
			setTimeout(() => this.start(), delay * 1000);
		}
	};

	private load() {
		if (this.path !== undefined) {
			const records = fg.globSync(this.path + "/*.{ts,js}");
			records.map(async (filename) => {
				let module: Descriptor = require(filename).default;
				this.add(module.interval, module.job, module.random);
			});
		}
	};
}

type Descriptor = {
	interval: string;
	job: () => void;
	random?: number;
}
