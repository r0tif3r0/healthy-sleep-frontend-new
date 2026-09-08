import type { ReactNode } from 'react';
import { Card } from '@/shared/ui';

interface LegendItem {
	color: string;
	label: string;
	shape?: 'square' | 'line';
}

interface ChartCardProps {
	title: string;
	legend?: LegendItem[];
	aside?: ReactNode;
	height?: number;
	children: ReactNode;
}

export function ChartCard({ title, legend, aside, height = 200, children }: ChartCardProps) {
	return (
		<Card className="flex flex-col gap-4 p-[22px_24px_18px]">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h2 className="font-display text-base font-bold">{title}</h2>
				{aside}
				{legend && (
					<div className="flex flex-wrap items-center gap-4 text-xs text-ink-2">
						{legend.map((item) => (
							<span key={item.label} className="flex items-center gap-1.5">
								<span
									className="flex-none rounded-[3px]"
									style={{
										background: item.color,
										width: item.shape === 'line' ? 18 : 9,
										height: item.shape === 'line' ? 3 : 9,
									}}
								/>
								{item.label}
							</span>
						))}
					</div>
				)}
			</div>
			<div style={{ height }}>{children}</div>
		</Card>
	);
}
