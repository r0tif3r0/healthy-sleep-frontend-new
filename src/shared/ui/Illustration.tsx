import type { CSSProperties } from 'react';
import type { IllustrationSource } from '@/assets/illustrations';

interface IllustrationProps {
	source: IllustrationSource;
	alt: string;
	className?: string;
	style?: CSSProperties;
	/** Герой лендинга и половина экрана входа видны сразу — их не откладываем. */
	eager?: boolean;
}

/**
 * Иллюстрация в двух форматах и двух плотностях: WebP для современных браузеров,
 * JPEG как запасной вариант, `srcSet` — чтобы на retina-экране не было мыла.
 */
export function Illustration({ source, alt, className, style, eager }: IllustrationProps) {
	return (
		// display:contents — чтобы <picture> не создавала лишний блок:
		// иначе absolute, w-full и object-cover на картинке считаются от неё, а не от родителя.
		<picture className="contents">
			<source type="image/webp" srcSet={`${source.webp} 1x, ${source.webp2x} 2x`} />
			<source type="image/jpeg" srcSet={`${source.jpg} 1x, ${source.jpg2x} 2x`} />
			<img
				src={source.jpg}
				alt={alt}
				className={className}
				style={style}
				loading={eager ? 'eager' : 'lazy'}
				decoding="async"
			/>
		</picture>
	);
}
