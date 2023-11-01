import {CacheDef} from "./types.js";

export class Client {
    constructor(readonly name:string, private key: string, private secret: string) {
    }
}