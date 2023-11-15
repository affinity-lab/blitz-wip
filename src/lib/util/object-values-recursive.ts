/**
 * Recursively extracts values from an object's properties, including nested objects.
 * Returns the values in a flattened array. If input is not an object, it's returned as a single-element array.
 *
 * @param {Object} obj - The input object to extract values from.
 * @returns {Array} An array containing all extracted values.
 */
export function objectValuesRecursive(obj: Record<string, any>): Array<any> {
	if (typeof obj === "object") {
		let arr: Array<any> = [...Object.values(obj).map((item) => objectValuesRecursive(item))];
		return arr.reduce((accumulator, value) => accumulator.concat(value), []);
	}
	return obj;
}
