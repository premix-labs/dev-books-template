export function withBase(path = '') {
	return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+|\/+$/g, '')}${path ? '/' : ''}`;
}
