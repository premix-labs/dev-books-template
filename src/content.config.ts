import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		// Render with the current Markdown processor, not cached HTML containing
		// stale Expressive Code asset hashes after an Astro dev config restart.
		loader: glob({
			base: './src/content/docs',
			pattern: '**/[^_]*.{md,mdx,markdown,mdown,mkdn,mkd,mdwn}',
			deferRender: true,
		}),
		schema: docsSchema(),
	}),
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
