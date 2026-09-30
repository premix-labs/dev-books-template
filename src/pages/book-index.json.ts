import { book } from '../../book.config.mjs';
import { getChapters } from '../lib/chapters';
export async function GET() {
	return Response.json({ id: book.id, title: book.title, chapters: await getChapters() });
}
