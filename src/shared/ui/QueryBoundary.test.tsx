import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QueryBoundary } from './QueryBoundary';

const query = <T,>(
	over: Partial<{
		isPending: boolean;
		isError: boolean;
		data: T;
		refetch: () => void;
		isPlaceholderData: boolean;
	}>,
) => ({
	isPending: false,
	isError: false,
	data: undefined as T | undefined,
	refetch: vi.fn(),
	...over,
});

describe('QueryBoundary', () => {
	it('пока едет новый период, оставляет прошлые данные вместо скелетона', () => {
		render(
			<QueryBoundary
				query={query<string[]>({ data: ['за 7 дней'], isPlaceholderData: true })}
				skeleton={<p>Загружаем</p>}
			>
				{(data) => <p>{data[0]}</p>}
			</QueryBoundary>,
		);

		// Экран не схлопывается: прошлые данные остаются на месте и помечены занятыми.
		expect(screen.getByText('за 7 дней')).toBeInTheDocument();
		expect(screen.queryByText('Загружаем')).not.toBeInTheDocument();
		expect(screen.getByText('за 7 дней').parentElement).toHaveAttribute('aria-busy', 'true');
	});

	it('на свежих данных пометки о занятости нет', () => {
		render(
			<QueryBoundary query={query<string[]>({ data: ['за 30 дней'] })}>
				{(data) => <p>{data[0]}</p>}
			</QueryBoundary>,
		);

		expect(screen.getByText('за 30 дней').parentElement).not.toHaveAttribute('aria-busy');
	});

	it('во время загрузки показывает скелетон, а не пустой экран', () => {
		render(
			<QueryBoundary query={query<string[]>({ isPending: true })} skeleton={<p>Загружаем</p>}>
				{() => <p>Данные</p>}
			</QueryBoundary>,
		);

		expect(screen.getByText('Загружаем')).toBeInTheDocument();
		expect(screen.queryByText('Данные')).not.toBeInTheDocument();
	});

	it('при ошибке показывает текст и кнопку повтора', async () => {
		const refetch = vi.fn();
		render(
			<QueryBoundary query={query<string[]>({ isError: true, refetch })}>{() => <p>Данные</p>}</QueryBoundary>,
		);

		expect(screen.getByText('Не удалось загрузить данные')).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
		expect(refetch).toHaveBeenCalledOnce();
	});

	it('ошибку можно подписать своим текстом', () => {
		render(
			<QueryBoundary query={query<string[]>({ isError: true })} errorText="Статистика не загрузилась">
				{() => <p>Данные</p>}
			</QueryBoundary>,
		);

		expect(screen.getByText('Статистика не загрузилась')).toBeInTheDocument();
	});

	it('пустой результат показывает переданное пустое состояние', () => {
		render(
			<QueryBoundary
				query={query<string[]>({ data: [] })}
				isEmpty={(data) => data.length === 0}
				empty={<p>Данных пока нет</p>}
			>
				{() => <p>Данные</p>}
			</QueryBoundary>,
		);

		expect(screen.getByText('Данных пока нет')).toBeInTheDocument();
		expect(screen.queryByText('Данные')).not.toBeInTheDocument();
	});

	it('данные попадают в children', () => {
		render(
			<QueryBoundary query={query<string[]>({ data: ['ночь'] })}>
				{(data) => <p>Ночей: {data.length}</p>}
			</QueryBoundary>,
		);

		expect(screen.getByText('Ночей: 1')).toBeInTheDocument();
	});

	it('без пустого состояния данные показываются как есть', () => {
		render(
			<QueryBoundary query={query<string[]>({ data: [] })}>{(data) => <p>Ночей: {data.length}</p>}</QueryBoundary>,
		);

		expect(screen.getByText('Ночей: 0')).toBeInTheDocument();
	});
});
