import { ScrollObserver, type ScrollObserverParams } from 'animejs';
import { rootLenis } from '$lib/core/lenis.svelte';
import { unref, type MaybeRef } from '$lib/utils/ref.svelte';
import type Lenis from 'lenis';

export type LenisScrollObserverParams = ScrollObserverParams & {
	lenis?: MaybeRef<Lenis | undefined>;
};

export class LenisScrollObserver extends ScrollObserver {
	#lenis?: Lenis;
	#unsubscribe?: () => void;
	#backward = false;

	constructor({ lenis = rootLenis, ...parameters }: LenisScrollObserverParams = {}) {
		const instance = unref(lenis);

		super({
			...parameters,
			container: instance
				? instance.options.wrapper === window
					? document.body
					: instance.options.wrapper
				: parameters.container
		});

		if (instance) {
			(this.container.useWin ? window : this.container.element).removeEventListener(
				'scroll',
				this.container
			);

			this.#unsubscribe = instance.on('scroll', () => this.container.handleScroll());
		}

		this.#lenis = instance;
	}

	override get velocity() {
		return this.#lenis ? Math.abs(this.#lenis.velocity) : this.container.velocity;
	}

	override get backward() {
		if (this.#lenis) {
			const dir = this.#lenis.direction;

			if (dir === 1) this.#backward = false;
			else if (dir === -1) this.#backward = true;

			return this.#backward;
		}

		return this.horizontal ? this.container.backwardX : this.container.backwardY;
	}

	override get scroll() {
		return this.#lenis
			? this.#lenis.scroll
			: this.horizontal
				? this.container.scrollX
				: this.container.scrollY;
	}

	override revert() {
		this.#unsubscribe?.();
		this.#unsubscribe = undefined;
		return super.revert();
	}
}

export const onLenisScroll = (parameters: LenisScrollObserverParams = {}) =>
	new LenisScrollObserver(parameters);
