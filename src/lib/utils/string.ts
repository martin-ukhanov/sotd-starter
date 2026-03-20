/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts text to URL-friendly slug format.
 *
 * @param text - The text to convert.
 * @returns The URL-safe slug string.
 */
export function toSlug(text: string) {
	return text
		.normalize('NFKD')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/--+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Pads a number with leading zeros until it reaches a specified target length.
 *
 * @param n - The number to be padded.
 * @param targetLength - The desired total length of the resulting string. Default `2`.
 * @returns The zero-padded string representation of the number.
 */
export function zeroPad(n: number, targetLength = 2) {
	return String(n).padStart(targetLength, '0');
}
