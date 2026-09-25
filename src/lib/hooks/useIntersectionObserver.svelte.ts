import { extract, type MaybeGetter } from '$lib/utils/getter';

export function useIntersectionObserver(
	target: MaybeGetter<Element | Element[] | undefined>,
	callback: IntersectionObserverCallback,
	options?: IntersectionObserverInit
) {
	$effect(() => {
		const elements = [extract(target) ?? []].flat();
		if (!elements.length) return;

		const observer = new IntersectionObserver(callback, options);

		for (const element of elements) {
			observer.observe(element);
		}

		return () => observer.disconnect();
	});
}
