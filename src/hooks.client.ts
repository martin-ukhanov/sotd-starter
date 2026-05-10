import { engine } from 'animejs';
import { createLenis, lenisInstances } from '$lib/lenis.svelte';
import { Raf } from '$lib/raf';
import type { ClientInit } from '@sveltejs/kit';

export const init: ClientInit = () => {
	createLenis({ root: true });

	Raf.add((time) => {
		lenisInstances.forEach((instance) => instance.raf(time));
	}, 'lenis');

	engine.useDefaultMainLoop = false;
	engine.defaults.duration = 500;
	engine.defaults.ease = 'outExpo';

	Raf.add(() => {
		engine.update();
	}, 'anime');

	Raf.start();
};
