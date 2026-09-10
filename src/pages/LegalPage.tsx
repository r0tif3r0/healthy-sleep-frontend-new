import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { ChevronLeftIcon } from '@/shared/icons';
import { POLICY_SECTIONS, POLICY_TITLE, POLICY_URL, type PolicyBlock } from '@/shared/lib/privacyPolicy';
import { Card } from '@/shared/ui';

function Block({ block }: { block: PolicyBlock }) {
	if (block.kind === 'text') {
		return <p className="text-[14px] leading-relaxed text-ink-2">{block.text}</p>;
	}

	if (block.kind === 'list') {
		return (
			<ul className="flex flex-col gap-2">
				{block.items.map((item) => (
					<li key={item} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-2">
						<span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-ink-4" />
						{item}
					</li>
				))}
			</ul>
		);
	}

	/*
	 * Таблица целей — определениями, а не <table>: две колонки на узком экране
	 * съезжают в нечитаемую кашу, а строк здесь всего четыре.
	 */
	return (
		<dl className="flex flex-col gap-4">
			{block.rows.map((row) => (
				<div key={row.label} className="flex flex-col gap-1.5 border-t border-line-soft pt-3 first:border-t-0 first:pt-0">
					<dt className="text-[11.5px] font-semibold tracking-[0.04em] text-ink-3 uppercase">{row.label}</dt>
					<dd className="flex flex-col gap-1.5">
						{row.items.map((item) => (
							<span key={item} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-2">
								{row.items.length > 1 && <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-ink-4" />}
								{item}
							</span>
						))}
					</dd>
				</div>
			))}
		</dl>
	);
}

export default function LegalPage() {
	const { isAuthenticated } = useAuth();

	return (
		<div
			className={
				isAuthenticated
					? 'flex flex-col gap-6'
					: 'mx-auto flex max-w-[860px] flex-col gap-6 px-4 py-12 sm:px-6'
			}
		>
			{!isAuthenticated && (
				<Link to="/" className="inline-flex w-fit items-center gap-2 text-[13.5px] text-brand-600 hover:underline">
					<ChevronLeftIcon size={16} />
					На главную
				</Link>
			)}

			<div className="flex flex-col gap-2">
				<h1 className="font-display text-[22px] font-bold sm:text-[27px]">{POLICY_TITLE}</h1>
				<p className="text-[13px] text-ink-3">
					Актуальная версия — {POLICY_URL}
				</p>
			</div>

			{POLICY_SECTIONS.map((section) => (
				<Card key={section.title} className="flex flex-col gap-3">
					<h2 className="font-display text-base font-bold">{section.title}</h2>
					{section.blocks.map((block, index) => (
						<Block key={index} block={block} />
					))}
				</Card>
			))}
		</div>
	);
}
