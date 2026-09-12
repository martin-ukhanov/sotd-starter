import 'animejs/adapters/three';
import { engine } from 'animejs';
import { createLenis, lenisRaf } from '$lib/core/lenis.svelte';
import { Raf } from '$lib/core/raf';
import type { ClientInit } from '@sveltejs/kit';

export const init: ClientInit = () => {
	// Lenis
	createLenis({ root: true });
	Raf.add((time) => lenisRaf(time), 'lenis');

	// Anime
	engine.useDefaultMainLoop = false;
	engine.defaults.duration = 500;
	engine.defaults.ease = 'outExpo';
	Raf.add(() => engine.update(), 'anime');

	Raf.start();
};
