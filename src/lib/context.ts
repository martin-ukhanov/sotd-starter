import { createContext } from 'svelte';
import type { Breakpoints } from '$lib/composables/useBreakpoints.svelte';

export const [getBreakpoints, setBreakpoints] = createContext<Breakpoints>();
