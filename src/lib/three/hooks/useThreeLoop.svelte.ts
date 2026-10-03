import { getThreeLoop } from '#lib/three/context.ts';
import type { ThreeLoopCallback, ThreeLoopOptions } from '#lib/three/types.ts';

export function useThreeLoop(callback: ThreeLoopCallback, options?: ThreeLoopOptions) {
	const subscribe = getThreeLoop();
	$effect(() => subscribe(callback, options));
}
