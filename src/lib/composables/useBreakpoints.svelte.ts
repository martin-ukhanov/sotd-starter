import { useEventListener } from '$lib/composables/useEventListener.svelte';

// Config
const BREAKPOINTS = {
	'2xs': 24,
	xs: 32,
	sm: 40,
	md: 48,
	lg: 64,
	xl: 80,
	'2xl': 96
} as const;

// Types
type Breakpoint = keyof typeof BREAKPOINTS;
export type Breakpoints = Record<Breakpoint, boolean>;

// Implementation
export function useBreakpoints() {
	const breakpoints = $state<Breakpoints>({
		'2xs': false,
		xs: false,
		sm: false,
		md: false,
		lg: false,
		xl: false,
		'2xl': false
	});

	$effect(() => {
		Object.entries(BREAKPOINTS).forEach(([name, value]) => {
			const mq = window.matchMedia(`(width >= ${value}rem)`);
			breakpoints[name as Breakpoint] = mq.matches;

			useEventListener(mq, 'change', () => {
				breakpoints[name as Breakpoint] = mq.matches;
			});
		});
	});

	return breakpoints;
}
