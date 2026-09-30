// Keep Expressive Code's accessible buttons and add an explicit failure state.
// Capture the click before its default handler, which silently ignores failure.
document.addEventListener('click', async (event) => {
	const target = event.target;
	if (!(target instanceof Element)) return;
	const button = target.closest<HTMLButtonElement>('.expressive-code .copy button');
	if (!button) return;
	event.stopImmediatePropagation();
	const frame = button.closest<HTMLElement>('.frame');
	const status = button.parentElement?.querySelector<HTMLElement>('[aria-live]');
	if (!frame || !status || button.dataset.code === undefined) return;
	if (button.getAttribute('aria-busy') === 'true') return;
	button.setAttribute('aria-busy','true');
	frame.querySelector('[data-copy-error]')?.remove();
	status.replaceChildren();
	try {
		await navigator.clipboard.writeText(button.dataset.code.replace(/\u007f/g,'\n'));
		const feedback = document.createElement('div');
		feedback.className = 'feedback show';
		feedback.textContent = 'คัดลอกแล้ว';
		status.append(feedback);
		window.setTimeout(() => feedback.remove(),2000);
	} catch {
		// Do not claim success or use deprecated execCommand when access is denied.
		const message = document.createElement('p');
		message.dataset.copyError = '';
		message.setAttribute('role','status');
		message.textContent = 'คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกโค้ดแล้วกด Ctrl+C / ⌘C หรือแตะค้างเพื่อคัดลอก';
		frame.append(message);
	} finally {
		button.removeAttribute('aria-busy');
	}
}, { capture:true });
