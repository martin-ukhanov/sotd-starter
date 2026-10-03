import { extract, type MaybeGetter } from '#lib/utils/getter.ts';
import { ref } from '#lib/utils/ref.svelte.ts';
import { useIntersectionObserver } from '#lib/hooks/useIntersectionObserver.svelte.ts';

export function useElementVisibility(
	target: MaybeGetter<Element | undefined>,
	options?: IntersectionObserverInit
) {
	const isVisible = ref(false);

	useIntersectionObserver(
		target,
		(entries) => {
			isVisible.current = entries.at(-1)!.isIntersecting;
		},
		options
	);

	$effect(() => {
		extract(target);
		return () => (isVisible.current = false);
	});

	return ref.readonly(isVisible);
}
