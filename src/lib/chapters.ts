import { getCollection } from 'astro:content';
import { book } from '../../book.config.mjs';
import { orderChapters } from './book-config.mjs';
import { withBase } from './paths';

export async function getChapters() {
	const entries = await getCollection('docs', ({ data }) => !data.draft);
	return orderChapters(entries.map(({ id, data }) => ({
		id, title: data.title, description: data.description ?? '',
		order: data.sidebar.order, href: withBase(id),
	})), book.parts);
}
