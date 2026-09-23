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
	import { getThree } from '$lib/three/context';

	let mesh = $state.raw<Mesh>();

	useThreeLoop(({ delta }) => {
		if (mesh) {
			mesh.rotation.x += delta;
			mesh.rotation.y += delta;
		}
	});

	// const { viewport } = getThree();

	// $effect(() => {
	// 	console.log(viewport.width);
	// });
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

<ThreeNode is={Mesh} bind:ref={mesh}>
	<ThreeNode is={BoxGeometry} args={[1, 1, 1]} />
	<ThreeNode is={MeshStandardMaterial} options={{ color: 'red' }} />
</ThreeNode>
