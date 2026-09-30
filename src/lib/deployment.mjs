/** @param {Record<string, string | undefined>} env */
export function deployment(env) {
	const [owner, repository] = (env.GITHUB_REPOSITORY || '').split('/');
	const userSite = owner && repository?.toLowerCase() === `${owner.toLowerCase()}.github.io`;
	const site = env.SITE_URL || (owner ? `https://${owner}.github.io` : 'http://localhost:4321');
	const siteUrl = new URL(site);
	if (!['http:', 'https:'].includes(siteUrl.protocol) || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password || siteUrl.pathname !== '/') throw new Error('SITE_URL must be an HTTP(S) origin without credentials, path, query, or fragment. Use BASE_PATH for the path.');
	const rawBase = env.BASE_PATH || (repository && !userSite ? `/${repository}` : '/');
	if (!rawBase.startsWith('/') || rawBase.startsWith('//') || /[?#\\%\s]/.test(rawBase) || rawBase.split('/').some(segment => segment === '.' || segment === '..')) throw new Error('BASE_PATH must be a local absolute path, for example /my-book.');
	const base = rawBase === '/' ? '/' : `/${rawBase.split('/').filter(Boolean).join('/')}`;
	return { site, base };
}
