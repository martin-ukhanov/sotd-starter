<script lang="ts">
	import { untrack, type Snippet } from 'svelte';

	export type TransitionHook = (el: Element) => void;
	export type TransitionDoneHook = (el: Element, done: () => void) => void;

	const {
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
	}: {
		show?: boolean;
		appear?: boolean;

		onBeforeEnter?: TransitionHook;
		onEnter?: TransitionDoneHook;
		onAfterEnter?: TransitionHook;
		onEnterCancelled?: TransitionHook;

		onBeforeLeave?: TransitionHook;
		onLeave?: TransitionDoneHook;
		onAfterLeave?: TransitionHook;
		onLeaveCancelled?: TransitionHook;

		children?: Snippet;
	} = $props();

	let wrapper = $state<HTMLElement>();
	let render = $state(untrack(() => show));

	let id = 0;
	let element: Element | null;
	let phase: 'idle' | 'enter' | 'leave' = 'idle';
	let isFirstEnter = untrack(() => show);

	function enter(el: Element) {
		if (phase === 'leave') onLeaveCancelled?.(el);

		const currentId = ++id;
		phase = 'enter';
		onBeforeEnter?.(el);

		const done = () => {
			if (currentId !== id) return;
			phase = 'idle';
			onAfterEnter?.(el);
		};

		if (onEnter) onEnter(el, done);
		else done();
	}

	function leave(el: Element) {
		if (phase === 'enter') onEnterCancelled?.(el);

		const currentId = ++id;
		phase = 'leave';
		onBeforeLeave?.(el);

		const done = () => {
			if (currentId !== id) return;
			phase = 'idle';
			render = false;
			onAfterLeave?.(el);
		};

		if (onLeave) onLeave(el, done);
		else done();
	}

	$effect(() => {
		if (!wrapper) {
			element = null;
			return;
		}

		element = wrapper.firstElementChild;

		untrack(() => {
			if (isFirstEnter) {
				isFirstEnter = false;
				if (!appear) return;
			}

			if (element) enter(element);
		});
	});

	$effect(() => {
		const next = show;

		untrack(() => {
			if (next) {
				if (phase === 'leave' && element) enter(element);
				render = true;
			} else if (element) {
				leave(element);
			} else {
				render = false;
			}
		});
	});
</script>

{#if render}
	<div bind:this={wrapper} class="contents">
		{@render children?.()}
	</div>
{/if}
