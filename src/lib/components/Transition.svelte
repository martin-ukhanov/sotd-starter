<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type TransitionHook = (el: Element) => void;
	export type TransitionRunHook = (el: Element, done: () => void) => void;

	export interface TransitionProps {
		show?: boolean;
		appear?: boolean;

		onBeforeEnter?: TransitionHook;
		onEnter?: TransitionRunHook;
		onAfterEnter?: TransitionHook;
		onEnterCancelled?: TransitionHook;

		onBeforeLeave?: TransitionHook;
		onLeave?: TransitionRunHook;
		onAfterLeave?: TransitionHook;
		onLeaveCancelled?: TransitionHook;

		children?: Snippet;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { dev } from '$app/env';
	import type { Attachment } from 'svelte/attachments';

	let {
		show = false,
		appear = false,

		onBeforeEnter,
		onEnter,
		onAfterEnter,
		onEnterCancelled,

		onBeforeLeave,
		onLeave,
		onAfterLeave,
		onLeaveCancelled,

		children
	}: TransitionProps = $props();

	let present = $state(untrack(() => show && !appear));

	let node: Element | null;
	let phase: 'enter' | 'leave' | null;
	let run = 0;
	let waiting = false;
	let first = true;

	const mount: Attachment<HTMLElement> = (wrapper) =>
		untrack(() => {
			node = wrapper.firstElementChild;
			if (dev) checkChildren(wrapper);

			if (waiting) {
				waiting = false;
				if (node) startEnter(node, run);
				else phase = null;
			}

			return () => {
				node = null;
			};
		});

	$effect(() => {
		const next = show; // the only tracked read
		untrack(() => {
			if (first) {
				first = false;
				if (!next || !appear) return; // nothing to animate on mount
			}
			if (next) enter();
			else leave();
		});
	});

	function enter() {
		if (phase === 'enter') return;
		const id = ++run;
		if (phase === 'leave' && node) onLeaveCancelled?.(node);
		phase = 'enter';

		// Interrupting a leave: the element is still mounted, so go straight in.
		if (present && node) {
			startEnter(node, id);
			return;
		}

		// Otherwise `mount` takes over once the element is in the DOM.
		present = true;
		waiting = true;
	}

	function startEnter(element: Element, id: number) {
		onBeforeEnter?.(element);
		hook(onEnter, element, id, () => {
			phase = null;
			onAfterEnter?.(element);
		});
	}

	function leave() {
		if (phase === 'leave' || !present) return;
		const id = ++run;
		if (phase === 'enter' && node) onEnterCancelled?.(node);
		phase = 'leave';
		waiting = false;

		const element = node;
		if (!element) {
			phase = null;
			present = false;
			return;
		}

		onBeforeLeave?.(element);
		hook(onLeave, element, id, () => {
			phase = null;
			present = false;
			onAfterLeave?.(element);
		});
	}

	function hook(
		fn: TransitionRunHook | undefined,
		element: Element,
		id: number,
		finish: () => void
	) {
		if (!fn) {
			finish();
			return;
		}
		let settled = false;
		fn(element, () => {
			if (settled || id !== run) return;
			settled = true;
			finish();
		});
	}

	let warned = false;

	function checkChildren(wrapper: HTMLElement) {
		if (warned) return;
		const count = wrapper.childElementCount;
		if (count === 1) return;
		warned = true;
		console.warn(
			count === 0
				? '<Transition>: nest a single element to animate — text and components that render no element of their own are not enough.'
				: `<Transition>: ${count} elements nested, only the first is animated. Wrap them in one element.`
		);
	}
</script>

{#if present}
	<div class="contents" {@attach mount}>
		{@render children?.()}
	</div>
{/if}
