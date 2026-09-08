/**
 * На экране телефон показывается маской +7 (XXX) XXX-XX-XX,
 * а в API уходит как +7XXXXXXXXXX. Храним в форме второй вид.
 */

export function digitsOf(value: string): string {
	let digits = value.replace(/\D/g, '');

	// Восьмёрка в начале — это междугородний префикс, а не первая цифра номера.
	if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
	else if (!digits.startsWith('7')) digits = `7${digits}`;

	return digits.slice(0, 11);
}

export function toApiPhone(value: string): string {
	const digits = digitsOf(value);
	return digits.length > 1 ? `+${digits}` : '';
}

export function maskPhone(value: string): string {
	const digits = digitsOf(value);
	if (digits.length <= 1) return '';

	const rest = digits.slice(1);
	let out = '+7';
	if (rest.length > 0) out += ` (${rest.slice(0, 3)}`;
	if (rest.length >= 3) out += ') ';
	if (rest.length > 3) out += rest.slice(3, 6);
	if (rest.length > 6) out += `-${rest.slice(6, 8)}`;
	if (rest.length > 8) out += `-${rest.slice(8, 10)}`;
	return out;
}
