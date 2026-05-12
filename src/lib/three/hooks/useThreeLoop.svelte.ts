import { getThreeLoop } from '$lib/three/context';
import type { ThreeLoopCallback, ThreeLoopOptions } from '$lib/three/types';

export function useThreeLoop(callback: ThreeLoopCallback, options?: ThreeLoopOptions) {
	const loop = getThreeLoop();

	$effect(() => {
		loop.add(callback, options);
		return () => loop.remove(callback);
	});
}
