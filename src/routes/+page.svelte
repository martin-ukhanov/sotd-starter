<script>
	import Example from '#lib/three/components/scenes/Example.svelte';
	import ThreeCanvas from '#lib/three/components/ThreeCanvas.svelte';
	import ThreeView from '#lib/three/components/view/ThreeView.svelte';
	import ThreeViewRenderer from '#lib/three/components/view/ThreeViewRenderer.svelte';
</script>

<h1 class="text-xl">Site of the Day (SOTD) Starter</h1>
<a class="underline" href="https://github.com/martin-ukhanov/sotd-starter">GitHub</a>

<div class="fixed inset-0">
	<ThreeCanvas>
		<ThreeViewRenderer />
	</ThreeCanvas>
</div>

<div class="h-screen"></div>

<div class="size-200 overflow-clip border">
	<div class="relative left-80 size-full">
		<ThreeView>
			<Example />
		</ThreeView>
	</div>
</div>

<div class="h-screen"></div>
