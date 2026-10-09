<script lang="ts" generics="T extends ThreeNodeConstructor">
	import { ref } from '#lib/utils/ref.svelte.ts';
	import { setThreeParent, getThreeParent } from '#lib/three/context.ts';
	import type { Snippet } from 'svelte';
	import type { ThreeNodeConstructor, ThreeNodeOptions } from '#lib/three/types.ts';

	type Scalable = { setScalar: (scalar: number) => unknown; isColor?: boolean };
	type Settable = { set: (...args: unknown[]) => unknown };
	type Copyable = { copy: (value: unknown) => unknown; uuid?: unknown };

	const isScalable = (v: unknown): v is Scalable =>
		typeof v === 'object' &&
		v !== null &&
		typeof (v as { setScalar?: unknown }).setScalar === 'function';

	const isSettable = (v: unknown): v is Settable =>
		typeof v === 'object' && v !== null && typeof (v as { set?: unknown }).set === 'function';

	const isCopyable = (v: unknown): v is Copyable =>
		typeof v === 'object' && v !== null && typeof (v as { copy?: unknown }).copy === 'function';

	let {
		is,
		args,
		options,
		attach,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-useless-assignment
		node = $bindable(),
		children
	}: {
		is: T;
		args?: ConstructorParameters<T>;
		options?: ThreeNodeOptions<InstanceType<T>>;
		attach?: string;
		node?: InstanceType<T>;
		children?: Snippet;
	} = $props();

	const parentRef = getThreeParent();
	const instanceRef = ref.raw<InstanceType<T>>();

	setThreeParent(ref.readonly(instanceRef));

	// Create & dispose instance
	$effect(() => {
		const instance = new is(...(args ?? [])) as InstanceType<T>;
		instanceRef.current = instance;
		node = instance;

		return () => {
			if (typeof instance.dispose === 'function') instance.dispose();
			instanceRef.current = undefined;
			node = undefined;
		};
	});

	// Apply options
	$effect(() => {
		const instance = instanceRef.current;
		if (!instance || !options) return;

		for (const [key, value] of Object.entries(options)) {
			const current = instance[key];
			const args = Array.isArray(value) ? value : [value];

			if (typeof current === 'function') {
				current.apply(instance, args);
			} else if (isScalable(current) && !current.isColor && typeof value === 'number') {
				current.setScalar(value);
			} else if (
				isSettable(current) &&
				(Array.isArray(value) || typeof value === 'number' || typeof value === 'string')
			) {
				current.set(...args);
			} else if (
				isCopyable(current) &&
				!current.uuid &&
				value !== null &&
				typeof value === 'object'
			) {
				current.copy(value);
			} else {
				instance[key] = value;
			}
		}
	});

	// Attach to & detach from parent
	$effect(() => {
		const parent = parentRef.current;
		const instance = instanceRef.current;

		if (!parent || !instance) return;

		if (attach) {
			(parent as Record<string, unknown>)[attach] = instance;
		} else if (instance.isObject3D && typeof parent.add === 'function') {
			parent.add(instance);
		} else if (instance.isBufferGeometry && 'geometry' in parent) {
			parent.geometry = instance;
		} else if (instance.isMaterial && 'material' in parent) {
			parent.material = instance;
		}

		return () => {
			if (attach) {
				const parentAttach = parent as Record<string, unknown>;
				if (parentAttach[attach] === instance) parentAttach[attach] = null;
			} else if (instance.isObject3D && typeof parent.remove === 'function') {
				parent.remove(instance);
			} else if (instance.isBufferGeometry && parent.geometry === instance) {
				parent.geometry = null;
			} else if (instance.isMaterial && parent.material === instance) {
				parent.material = null;
			}
		};
	});
</script>

{@render children?.()}
