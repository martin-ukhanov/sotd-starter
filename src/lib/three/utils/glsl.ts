export function glslFloat(value: number) {
	return Number.isInteger(value) ? `${value}.0` : `${value}`;
}
