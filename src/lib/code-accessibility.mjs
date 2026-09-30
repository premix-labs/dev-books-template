/** Enhance generated code HTML, including when reader JavaScript is disabled. */
export function makeCodeFocusable(tree) {
	const visit = node => {
		if (node.type === 'element' && node.tagName === 'pre') {
			node.properties ??= {};
			node.properties.tabIndex = 0;
			node.properties.role = 'region';
			node.properties.ariaLabel ??= 'โค้ดหรือผลลัพธ์ เลื่อนแนวนอนได้';
		}
		node.children?.forEach(visit);
	};
	visit(tree);
}

/** Markdown tables retain keyboard scrolling without client-side JavaScript. */
export const focusableTables = {
	name: 'keyboard-readable-tables',
	element: {
		filter: ['table'],
		visit(node, context) {
			context.setProperty(node, 'tabIndex', 0);
			if (!node.properties.ariaLabel) context.setProperty(node, 'ariaLabel', 'ตาราง เลื่อนแนวนอนได้');
		},
	},
};
