/** @typedef {{ id: string, title: string, headline: string[], description: string, author: string, contentsLabel: string, showAuthorGuide: boolean, cover: { fileName: string, language: import('astro').CodeLanguage, code: string }, parts: { label: string, directory: string }[] }} BookConfig */

/** @param {BookConfig} book @returns {BookConfig} */
export function defineBook(book) {
	const required = (value, field) => {
		if (typeof value !== 'string' || !value.trim()) throw new Error(`book.config.mjs: ${field} must be non-empty text.`);
	};
	for (const field of ['id', 'title', 'description', 'author', 'contentsLabel']) required(book[field], field);
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.id)) throw new Error('book.config.mjs: id must be a lowercase URL-safe slug.');
	if (!Array.isArray(book.headline) || !book.headline.length || book.headline.length > 3) throw new Error('book.config.mjs: headline needs 1–3 lines.');
	book.headline.forEach(line => required(line, 'headline'));
	if (typeof book.showAuthorGuide !== 'boolean') throw new Error('book.config.mjs: showAuthorGuide must be true or false.');
	for (const field of ['fileName', 'language', 'code']) required(book.cover?.[field], `cover.${field}`);
	if (!Array.isArray(book.parts) || !book.parts.length) throw new Error('book.config.mjs: add at least one part.');
	const directories = [];
	for (const part of book.parts) {
		required(part.label, 'parts.label');
		if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(part.directory) || ['about', '404', 'index'].includes(part.directory.split('/')[0])) throw new Error('book.config.mjs: use URL-safe, non-reserved part directories.');
		if (directories.some(directory => directory === part.directory || directory.startsWith(`${part.directory}/`) || part.directory.startsWith(`${directory}/`))) throw new Error('book.config.mjs: part directories must not duplicate or overlap.');
		directories.push(part.directory);
	}
	return book;
}

/** Validate published chapters before rendering lists or navigation.
 * @template {{ id: string, order?: number }} T
 * @param {T[]} chapters @param {BookConfig['parts']} parts @returns {T[]}
 */
export function orderChapters(chapters, parts) {
	if (!chapters.length) throw new Error('Publish at least one chapter in a configured book part.');
	const used = new Set();
	const partIndex = chapter => parts.findIndex(part => chapter.id === part.directory || chapter.id.startsWith(`${part.directory}/`));
	for (const chapter of chapters) {
		if (partIndex(chapter) < 0) throw new Error(`${chapter.id}: not inside a configured part.`);
		if (!Number.isSafeInteger(chapter.order) || chapter.order <= 0 || used.has(chapter.order)) throw new Error(`${chapter.id}: sidebar.order must be a unique positive integer.`);
		used.add(chapter.order);
	}
	const sorted = [...chapters].sort((a, b) => a.order - b.order);
	if (sorted.some((chapter, index) => index > 0 && partIndex(chapter) < partIndex(sorted[index - 1]))) throw new Error('Chapter orders must follow the order of book.parts.');
	return sorted;
}
