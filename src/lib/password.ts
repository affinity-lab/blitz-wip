import * as crypto from "crypto";

export class Password {
    constructor(private readonly pepper: Buffer) {
    };

    async hash(password: string): Promise<string> {
        return crypto.createHash("sha256").update(password + this.pepper).digest("hex");
    };
}
