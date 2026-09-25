import { ScrollObserver, type ScrollObserverParams } from 'animejs';
import { rootLenis } from '$lib/core/lenis.svelte';
import { unref, type MaybeRef } from '$lib/utils/ref.svelte';
import type Lenis from 'lenis';

type Container = ScrollObserver['container'];

export type LenisScrollObserverParams = ScrollObserverParams & {
	lenis?: MaybeRef<Lenis | undefined>;
};

const bindings = new WeakMap<Container, { count: number; unbind: () => void }>();

function bind(container: Container, lenis: Lenis) {
	const binding = bindings.get(container);

	if (binding) {
		binding.count++;
		return;
	}

	const target = container.useWin ? window : container.element;
	target.removeEventListener('scroll', container);
	const off = lenis.on('scroll', () => container.handleScroll());

	bindings.set(container, {
		count: 1,
		unbind: () => {
			off();
			target.addEventListener('scroll', container, false);
		}
	});
}

function unbind(container: Container) {
	const binding = bindings.get(container);
	if (!binding || --binding.count > 0) return;
	binding.unbind();
	bindings.delete(container);
}

export class LenisScrollObserver extends ScrollObserver {
	#lenis?: Lenis;
	#backward = false;

	constructor({ lenis = rootLenis, ...parameters }: LenisScrollObserverParams = {}) {
		const instance = unref(lenis);
		const wrapper = instance?.options.wrapper;

		super({
			...parameters,
			container: wrapper ? (wrapper === window ? document.body : wrapper) : parameters.container
		});

		if (instance) {
			this.#lenis = instance;
			bind(this.container, instance);
		}
	}

	get #active() {
		return this.#lenis && this.horizontal === this.#lenis.isHorizontal ? this.#lenis : undefined;
	}

	override get backward() {
		const lenis = this.#active;
		if (!lenis) return super.backward;

		if (lenis.direction) this.#backward = lenis.direction < 0;
		return this.#backward;
	}

	override get scroll() {
		return this.#active?.scroll ?? super.scroll;
	}

	override revert() {
		if (!this.reverted && this.#lenis) unbind(this.container);
		return super.revert();
	}
}

export const onLenisScroll = (parameters: LenisScrollObserverParams = {}) =>
	new LenisScrollObserver(parameters);
