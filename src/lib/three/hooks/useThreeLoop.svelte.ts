import { getThreeLoop } from '$lib/three/context';
import type { ThreeLoopCallback, ThreeLoopOptions } from '$lib/three/types';

export function useThreeLoop(callback: ThreeLoopCallback, options?: ThreeLoopOptions) {
	const subscribe = getThreeLoop();
	$effect(() => subscribe(callback, options));
}
