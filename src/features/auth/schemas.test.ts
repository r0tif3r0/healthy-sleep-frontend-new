import { describe, expect, it } from 'vitest';
import {
	additionalSchema,
	birthDateSchema,
	nameSchema,
	passwordRules,
	passwordSchema,
	phoneSchema,
	registerStep3Schema,
	requiredName,
} from './schemas';

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, value: unknown) =>
	schema.safeParse(value).success;

describe('пароль', () => {
	it('принимает пароль со всеми требованиями', () => {
		expect(ok(passwordSchema, 'Terapiya1!')).toBe(true);
	});

	it('отклоняет короткий, без заглавной, без цифры и без спецсимвола', () => {
		expect(ok(passwordSchema, 'Ter1!')).toBe(false);
		expect(ok(passwordSchema, 'terapiya1!')).toBe(false);
		expect(ok(passwordSchema, 'Terapiya!')).toBe(false);
		expect(ok(passwordSchema, 'Terapiya1')).toBe(false);
	});

	it('живая проверка совпадает со схемой', () => {
		const value = 'Terapiya1!';
		expect(passwordRules.every((rule) => rule.test(value))).toBe(true);
		expect(passwordRules.filter((rule) => rule.test('terapiya'))).toHaveLength(1);
	});

	it('подтверждение должно совпадать', () => {
		expect(ok(registerStep3Schema, { password: 'Terapiya1!', confirmPassword: 'Terapiya1!' })).toBe(true);
		expect(ok(registerStep3Schema, { password: 'Terapiya1!', confirmPassword: 'Terapiya2!' })).toBe(false);
	});
});

describe('телефон', () => {
	it('принимает +7 и десять цифр', () => {
		expect(ok(phoneSchema, '+79214481602')).toBe(true);
	});

	it('отклоняет другой формат', () => {
		expect(ok(phoneSchema, '89214481602')).toBe(false);
		expect(ok(phoneSchema, '+7921448160')).toBe(false);
		expect(ok(phoneSchema, '+7 (921) 448-16-02')).toBe(false);
	});
});

describe('имя', () => {
	it('принимает буквы и дефис', () => {
		expect(ok(nameSchema, 'Смирнова')).toBe(true);
		expect(ok(nameSchema, 'Римская-Корсакова')).toBe(true);
	});

	it('отклоняет цифры и слишком длинное', () => {
		expect(ok(nameSchema, 'Смирнова1')).toBe(false);
		expect(ok(nameSchema, 'а'.repeat(31))).toBe(false);
	});
});

describe('дата рождения', () => {
	it('принимает дату в прошлом', () => {
		expect(ok(birthDateSchema, '1971-03-14')).toBe(true);
	});

	it('отклоняет дату в будущем', () => {
		expect(ok(birthDateSchema, '2099-01-01')).toBe(false);
	});

	it('отклоняет нечитаемую дату', () => {
		expect(ok(birthDateSchema, 'не дата')).toBe(false);
	});
});

describe('дополнительно', () => {
	it('не длиннее 250 символов', () => {
		expect(ok(additionalSchema, 'а'.repeat(250))).toBe(true);
		expect(ok(additionalSchema, 'а'.repeat(251))).toBe(false);
	});
});

describe('обязательные поля', () => {
	it('у пустого поля сообщение про пустоту, а не про допустимые символы', () => {
		const result = requiredName('Укажите фамилию').safeParse('');
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.issues[0].message).toBe('Укажите фамилию');
	});

	it('заполненное поле по-прежнему проверяется на символы', () => {
		const result = requiredName('Укажите фамилию').safeParse('Смирнова1');
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.issues[0].message).toBe('Только буквы и дефис');
	});
});
