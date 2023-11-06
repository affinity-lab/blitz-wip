export class BlitzError {
    constructor(
        readonly message: string,
        readonly code: string,
        readonly details?: Record<string, any>,
        readonly httpResponseCode: number = 500,
		readonly silent:boolean = false
    ) {
    }
}