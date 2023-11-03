

export class BlitzError {
	constructor(readonly message: string, readonly code: string, readonly details?: Record<string, any>) {
	}
}