<script lang="ts">
	import { ref } from '#lib/utils/ref.svelte.ts';
	import {
		getThree,
		setThree,
		getThreeLoop,
		setThreeLoop,
		setThreeParent
	} from '#lib/three/context.ts';
	import type { ThreeView } from '#lib/three/types.ts';

	const { view }: { view: ThreeView } = $props();

	const { canvas, size, renderer } = getThree();
	const subscribe = getThreeLoop();

	setThree({
		canvas,
		renderer,

		get domElement() {
			return view.domElement;
		},
		size: {
			get width() {
				return view.viewport.width;
			},
			get height() {
				return view.viewport.height;
			},
			get pixelRatio() {
				return size.pixelRatio;
			}
		},
		get scene() {
			return view.scene;
		},
		get camera() {
			return view.camera;
		},
		get isVisible() {
			return view.isVisible;
		},
		get render() {
			return view.render;
		},
		set render(value) {
			view.render = value;
		}
	});

	setThreeLoop((callback, options) =>
		subscribe((state) => {
			if (view.isVisible.current) callback(state);
		}, options)
	);

	setThreeParent(ref.from(() => view.scene));
</script>

{@render view.children?.()}
