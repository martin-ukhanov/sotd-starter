import { engine } from 'animejs';
import { createLenis, lenisInstances } from '$lib/lenis.svelte';
import { addRafCallback, startRafLoop } from '$lib/raf';
import type { ClientInit } from '@sveltejs/kit';

export const init: ClientInit = () => {
	createLenis({ root: true });

	addRafCallback((time) => {
		lenisInstances.forEach((instance) => instance.raf(time));
	}, 'lenis');

	engine.useDefaultMainLoop = false;
	engine.defaults.duration = 500;
	engine.defaults.ease = 'outExpo';

	addRafCallback(() => {
		engine.update();
	}, 'anime');

	startRafLoop();
};
