import { CheckIcon } from '@/shared/icons';
import { cn } from '@/shared/lib/cn';
import { passwordRules } from './schemas';

export function PasswordRules({ value }: { value: string }) {
	return (
		<ul className="flex flex-col gap-2">
			<li className="text-[12.5px] font-semibold text-ink-2">Пароль должен содержать:</li>
			{passwordRules.map((rule) => {
				const passed = rule.test(value);
				return (
					<li key={rule.label} className="flex items-start gap-2 text-[12.5px] leading-snug">
						<CheckIcon
							size={15}
							className={cn('mt-px flex-none', passed ? 'text-ok' : 'text-ink-4')}
						/>
						<span className={passed ? 'text-ok-700' : 'text-ink-3'}>{rule.label}</span>
					</li>
				);
			})}
		</ul>
	);
}
