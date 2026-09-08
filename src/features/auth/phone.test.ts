import { describe, expect, it } from 'vitest';
import { maskPhone, toApiPhone } from './phone';

describe('маска телефона', () => {
	it('собирает +7 (XXX) XXX-XX-XX по мере ввода', () => {
		expect(maskPhone('9')).toBe('+7 (9');
		expect(maskPhone('921')).toBe('+7 (921) ');
		expect(maskPhone('921448')).toBe('+7 (921) 448');
		expect(maskPhone('9214481602')).toBe('+7 (921) 448-16-02');
	});

	it('не теряет цифры при вводе с восьмёрки и с +7', () => {
		expect(maskPhone('89214481602')).toBe('+7 (921) 448-16-02');
		expect(maskPhone('+7 (921) 448-16-02')).toBe('+7 (921) 448-16-02');
	});

	it('в API уходит без маски', () => {
		expect(toApiPhone('+7 (921) 448-16-02')).toBe('+79214481602');
		expect(toApiPhone('')).toBe('');
	});

	it('лишние цифры отбрасываются', () => {
		expect(toApiPhone('+7921448160299')).toBe('+79214481602');
	});
});
