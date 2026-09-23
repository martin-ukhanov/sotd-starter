<!-- <script>
	import Transition from '$lib/components/Transition.svelte';
	import { animate } from 'animejs';

	let show = $state(true);

	$effect(() => {
		const id = setInterval(() => (show = !show), 1000);
		return () => clearInterval(id);
	});
</script>

<Transition
	{show}
	appear
	onEnter={(el, done) => {
		animate(el, {
			scale: [0, 1],
			duration: 500,
			onComplete: done
		});
	}}
	onLeave={(el, done) => {
		animate(el, {
			scale: 0,
			duration: 500,
			onComplete: done
		});
	}}
>
	<div class="size-64 bg-[red]"></div>
</Transition> -->

<script lang="ts">
	import Example from '$lib/three/components/scenes/Example.svelte';
	import ThreeCanvas from '$lib/three/components/ThreeCanvas.svelte';
	import ThreeView from '$lib/three/components/view/ThreeView.svelte';
	import ThreeViewRenderer from '$lib/three/components/view/ThreeViewRenderer.svelte';
</script>

<div class="fixed inset-0">
	<ThreeCanvas>
		<ThreeViewRenderer />
	</ThreeCanvas>
</div>

<div class="h-screen"></div>

<div class="h-screen">
	<ThreeView>
		<Example />
	</ThreeView>
</div>

<div class="h-screen"></div>
