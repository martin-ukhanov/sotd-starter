import { engine } from 'animejs';
import { createLenis, lenisInstances } from '$lib/lenis';
import type { ClientInit } from '@sveltejs/kit';

export const init: ClientInit = () => {
	// Anime
	engine.useDefaultMainLoop = false;
	engine.defaults.duration = 500;
	engine.defaults.ease = 'outExpo';

	// Lenis
	createLenis({ root: true });

	// RAF loop
	function raf(time: number) {
		lenisInstances.forEach((instance) => instance.raf(time));
		engine.update();
		requestAnimationFrame(raf);
	}

	requestAnimationFrame(raf);
};
