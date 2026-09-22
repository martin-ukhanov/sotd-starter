import { extract, type MaybeGetter } from '$lib/utils/getter';
import { ref } from '$lib/utils/ref.svelte';
import { useIntersectionObserver } from '$lib/hooks/useIntersectionObserver.svelte';

export function useElementVisibility(
	target: MaybeGetter<Element | undefined>,
	options?: IntersectionObserverInit
) {
	const isVisible = ref(false);

	useIntersectionObserver(
		target,
		([entry]) => {
			isVisible.current = entry.isIntersecting;
		},
		options
	);

	$effect(() => {
		extract(target);
		return () => (isVisible.current = false);
	});

	return ref.readonly(isVisible);
}
