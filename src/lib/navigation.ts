import { book } from '../../book.config.mjs';
import { withBase } from './paths';

export function getNavigation(pathname: string) {
	return [
		{ label: 'หน้าแรก', href: withBase() },
		{ label: 'สารบัญ', href: `${withBase()}#books` },
		...(book.showAuthorGuide ? [{ label: 'วิธีใช้ Template', href: withBase('about') }] : []),
	].map(item => ({ ...item, active: !item.href.includes('#') && pathname === item.href }));
}
