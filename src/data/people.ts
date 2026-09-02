/**
 * src/data/people.ts — реестр портретов персон конференции.
 *
 * Что делает: связывает строковый `photoKey` из контентных файлов с реальным
 * импортом изображения, чтобы Astro мог обработать его через `<Image />`
 * (ресайз, webp/avif, размеры в HTML) вместо отдачи «сырого» файла из public.
 *
 * Как работает: изображения импортируются статически из `src/assets/people`,
 * поэтому попадают в граф сборки и оптимизируются на этапе build. Функция
 * `getPortrait` возвращает `ImageMetadata` либо undefined для персон
 * «на согласовании» — карточки-заглушки рендерятся без фото.
 *
 * Связан с: `src/data/content.ru.ts` и `content.en.ts` (поле `photoKey`),
 * компонент карточки персоны `src/components/common/PersonCard.astro`.
 */
import type { ImageMetadata } from 'astro';

import baturina from '~/assets/people/baturina.png';
import belozerova from '~/assets/people/belozerova.png';
import chevtaeva from '~/assets/people/chevtaeva.jpg';
import deyneka from '~/assets/people/deyneka.jpg';
import gushchin from '~/assets/people/gushchin.png';
import kuntsevich from '~/assets/people/kuntsevich.jpg';
import lobanova from '~/assets/people/lobanova.jpg';
import matemulane from '~/assets/people/matemulane.png';
import patrakov from '~/assets/people/patrakov.png';
import sosnin from '~/assets/people/sosnin.png';
import vorontsova from '~/assets/people/vorontsova.jpeg';

/** Портреты персон. Ключи используются в контенте как `photoKey`. */
export const portraits = {
  baturina,
  belozerova,
  chevtaeva,
  deyneka,
  gushchin,
  kuntsevich,
  lobanova,
  matemulane,
  patrakov,
  sosnin,
  vorontsova,
} satisfies Record<string, ImageMetadata>;

export type PortraitKey = keyof typeof portraits;

/**
 * Возвращает метаданные портрета по ключу.
 * Используется в карточках оргкомитета и спикеров: для персон «на согласовании»
 * ключа нет, и функция отдаёт undefined — карточка рисует нейтральную заглушку.
 */
export function getPortrait(key?: string): ImageMetadata | undefined {
  if (!key) return undefined;
  return portraits[key as PortraitKey];
}
