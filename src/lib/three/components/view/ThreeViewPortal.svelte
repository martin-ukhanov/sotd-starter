<script lang="ts">
	import { getThreeLoop, setThreeLoop, setThreeParent } from '$lib/three/context';
	import type { ThreeView, ThreeLoopCallback, ThreeLoop } from '$lib/three/types';

	const { view }: { view: ThreeView } = $props();

	const loop = getThreeLoop();
	const wrappedCallbacks = new WeakMap<ThreeLoopCallback, ThreeLoopCallback>();

	const addLoopCallback: ThreeLoop['add'] = (callback, options) => {
		let wrappedCallback = wrappedCallbacks.get(callback);

		if (!wrappedCallback) {
			wrappedCallback = (state) => {
				if (view.isIntersecting) callback(state);
			};

			wrappedCallbacks.set(callback, wrappedCallback);
		}

		loop.add(wrappedCallback, options);
	};

	const removeLoopCallback: ThreeLoop['remove'] = (callback) => {
		const wrappedCallback = wrappedCallbacks.get(callback);

		if (wrappedCallback) {
			wrappedCallbacks.delete(callback);
			loop.remove(wrappedCallback);
		}
	};

	setThreeLoop({
		get add() {
			return addLoopCallback;
		},
		get remove() {
			return removeLoopCallback;
		}
	});

	setThreeParent({
		get current() {
			return view.scene;
		}
	});
</script>

{@render view.children?.()}
