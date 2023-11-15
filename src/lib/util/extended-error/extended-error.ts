/**
 * Custom error class that extends the built-in Error class and includes additional properties.
 */
export class ExtendedError extends Error {
	/**
	 * Constructs an instance of ExtendedError.
	 * @param message - A human-readable description of the error.
	 * @param code - A string code representing the error for programmatic handling.
	 * @param details - Additional details or context about the error (optional).
	 * @param httpResponseCode - The HTTP response code associated with the error (default: 500).
	 * @param silent - Indicates whether the error should be logged or displayed (default: false).
	 */
	constructor(
		readonly message: string,
		readonly code: string,
		readonly details?: Record<string, any>,
		readonly httpResponseCode: number = 500,
		readonly silent: boolean = false
	) {
		// Calls the constructor of the base Error class with the provided message.
		super(message);

		// Additional properties specific to ExtendedError.
		this.name = 'ExtendedError'; // Name of the error type.
		this.httpResponseCode = httpResponseCode;
		this.silent = silent;

		// An optional property providing additional information about the error cause.
		// This is added to the Error object as 'cause' for potential further analysis.
		this.cause = { code };
	}
}
