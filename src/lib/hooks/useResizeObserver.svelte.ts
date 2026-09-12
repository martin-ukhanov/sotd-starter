import { extract, type MaybeGetter } from '$lib/utils/getter';

export function useResizeObserver(
	target: MaybeGetter<Element | Element[] | undefined>,
	callback: ResizeObserverCallback,
	options?: ResizeObserverOptions
) {
	$effect(() => {
		const elements = [extract(target) ?? []].flat();
		if (!elements.length) return;

		const observer = new ResizeObserver(callback);
		elements.forEach((element) => observer.observe(element, options));

		return () => observer.disconnect();
	});
}
