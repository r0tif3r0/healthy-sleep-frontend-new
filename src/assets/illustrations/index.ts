import heroWebp from './hero-devices.webp';
import heroWebp2x from './hero-devices@2x.webp';
import heroJpg from './hero-devices.jpg';
import heroJpg2x from './hero-devices@2x.jpg';

import authWebp from './auth-night.webp';
import authWebp2x from './auth-night@2x.webp';
import authJpg from './auth-night.jpg';
import authJpg2x from './auth-night@2x.jpg';

import uploadWebp from './upload-band.webp';
import uploadWebp2x from './upload-band@2x.webp';
import uploadJpg from './upload-band.jpg';
import uploadJpg2x from './upload-band@2x.jpg';

import sleepWebp from './empty-sleep.webp';
import sleepWebp2x from './empty-sleep@2x.webp';
import sleepJpg from './empty-sleep.jpg';
import sleepJpg2x from './empty-sleep@2x.jpg';

export interface IllustrationSource {
	webp: string;
	webp2x: string;
	jpg: string;
	jpg2x: string;
}

/**
 * Иллюстрации собираются скриптом scripts/build-illustrations.mjs из оригиналов
 * в ../new-assets — в двух плотностях и двух форматах. Руками файлы не правим.
 */
export const illustrations = {
	heroDevices: { webp: heroWebp, webp2x: heroWebp2x, jpg: heroJpg, jpg2x: heroJpg2x },
	authNight: { webp: authWebp, webp2x: authWebp2x, jpg: authJpg, jpg2x: authJpg2x },
	uploadBand: { webp: uploadWebp, webp2x: uploadWebp2x, jpg: uploadJpg, jpg2x: uploadJpg2x },
	emptySleep: { webp: sleepWebp, webp2x: sleepWebp2x, jpg: sleepJpg, jpg2x: sleepJpg2x },
} satisfies Record<string, IllustrationSource>;
