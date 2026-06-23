<script lang="ts">
	import {
		PerspectiveCamera,
		DirectionalLight,
		Mesh,
		BoxGeometry,
		MeshStandardMaterial
	} from 'three';
	import { useThreeLoop } from '$lib/three/hooks/useThreeLoop.svelte';
	import ThreeNode from '$lib/three/components/ThreeNode.svelte';

	let box = $state.raw<Mesh>();

	useThreeLoop(({ delta }) => {
		if (box) {
			box.rotation.x += delta;
			box.rotation.y += delta;
		}
	});
</script>

<ThreeNode
	is={PerspectiveCamera}
	options={{
		position: [0, 2, 4],
		lookAt: [0, 0, 0]
	}}
/>

<ThreeNode
	is={DirectionalLight}
	options={{
		color: 'white',
		intensity: 2,
		position: [0, 2, 4],
		lookAt: [0, 0, 0]
	}}
/>

<ThreeNode is={Mesh} bind:ref={box}>
	<ThreeNode is={BoxGeometry} args={[1, 1, 1]} />
	<ThreeNode is={MeshStandardMaterial} options={{ color: 'red' }} />
</ThreeNode>
