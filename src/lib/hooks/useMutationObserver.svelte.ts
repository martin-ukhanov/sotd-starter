import { extract, type MaybeGetter } from '#lib/utils/getter.ts';

export function useMutationObserver(
	target: MaybeGetter<Node | Node[] | undefined>,
	callback: MutationCallback,
	options?: MutationObserverInit
) {
	$effect(() => {
		const nodes = [extract(target) ?? []].flat();
		if (!nodes.length) return;

		const observer = new MutationObserver(callback);

		for (const node of nodes) {
			observer.observe(node, options);
		}

		return () => observer.disconnect();
	});
}
