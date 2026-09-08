import { cn } from '@/shared/lib/cn';
import { initials } from '@/shared/lib/format';

type AvatarTone = 'blue' | 'amber' | 'cyan' | 'muted';

const TONES: Record<AvatarTone, string> = {
	blue: 'bg-brand-050 text-brand-600',
	amber: 'bg-accent-050 text-accent-700',
	cyan: 'bg-data-400 text-night-950',
	muted: 'bg-surface-2 text-ink-2',
};

interface AvatarProps {
	person: { last_name?: string | null; first_name?: string | null } | null | undefined;
	tone?: AvatarTone;
	size?: number;
	className?: string;
}

export function Avatar({ person, tone = 'blue', size = 38, className }: AvatarProps) {
	return (
		<span
			className={cn(
				'inline-flex flex-none items-center justify-center rounded-[12px] font-display font-bold',
				TONES[tone],
				className,
			)}
			style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
			aria-hidden="true"
		>
			{initials(person)}
		</span>
	);
}
