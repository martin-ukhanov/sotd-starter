import { engine } from 'animejs';
import { createLenis, lenisInstances } from '$lib/lenis';
import { addRafTick, startRafLoop } from '$lib/raf';
import type { ClientInit } from '@sveltejs/kit';

export const init: ClientInit = () => {
	createLenis({ root: true });

	addRafTick((time) => {
		lenisInstances.forEach((instance) => instance.raf(time));
	}, 'lenis');

	engine.useDefaultMainLoop = false;
	engine.defaults.duration = 500;
	engine.defaults.ease = 'outExpo';

	addRafTick(() => {
		engine.update();
	}, 'anime');

	startRafLoop();
};
