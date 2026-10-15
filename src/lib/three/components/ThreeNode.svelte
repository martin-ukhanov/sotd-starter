<script lang="ts" module>
	import type { ThreeNode } from '#lib/three/types.ts';

	type Scalable = { setScalar: (scalar: number) => unknown; isColor?: boolean };
	type Settable = { set: (...args: unknown[]) => unknown };
	type Copyable = { copy: (value: unknown) => unknown; clone?: () => unknown; uuid?: unknown };
	type Indexable = Record<string, unknown>;

	const originals = new WeakMap<ThreeNode, Map<string, unknown>>();

	function isScalable(v: unknown): v is Scalable {
		return (
			typeof v === 'object' &&
			v !== null &&
			typeof (v as { setScalar?: unknown }).setScalar === 'function'
		);
	}

	function isSettable(v: unknown): v is Settable {
		return (
			typeof v === 'object' && v !== null && typeof (v as { set?: unknown }).set === 'function'
		);
	}

	function isCopyable(v: unknown): v is Copyable {
		return (
			typeof v === 'object' && v !== null && typeof (v as { copy?: unknown }).copy === 'function'
		);
	}

	function isMethodCall(
		member: unknown,
		value: unknown
	): member is (...args: unknown[]) => unknown {
		return typeof member === 'function' && typeof value !== 'function';
	}

	function applyOption(target: Indexable, key: string, value: unknown) {
		const current = target[key];
		const isValueArray = Array.isArray(value);
		const args = isValueArray ? value : [value];

		if (isMethodCall(current, value)) {
			current.apply(target, args);
		} else if (isScalable(current) && !current.isColor && typeof value === 'number') {
			current.setScalar(value);
		} else if (
			isSettable(current) &&
			(isValueArray || typeof value === 'number' || typeof value === 'string')
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
			target[key] = value;
		}
	}
</script>

<script lang="ts" generics="T extends ThreeNodeConstructor">
	import { ref } from '#lib/utils/ref.svelte.ts';
	import { setThreeParent, getThreeParent } from '#lib/three/context.ts';
	import type { Snippet } from 'svelte';
	import type { ThreeNodeConstructor, ThreeNodeArgs, ThreeNodeOptions } from '#lib/three/types.ts';

	type Instance = InstanceType<T>;

	let {
		is,
		args,
		options,
		attach,
		// eslint-disable-next-line no-useless-assignment
		node = $bindable(),
		children
	}: {
		is: T;
		args?: ThreeNodeArgs<T>;
		options?: ThreeNodeOptions<Instance>;
		attach?: string;
		node?: Instance;
		children?: Snippet;
	} = $props();

	const parentRef = getThreeParent();
	const instanceRef = ref.raw<ThreeNode>();

	setThreeParent(ref.readonly(instanceRef));

	// Create & dispose instance
	$effect(() => {
		const instance: ThreeNode = new is(...(args ?? []));
		instanceRef.current = instance;
		node = instance as Instance;

		return () => {
			instance.dispose?.();
			instanceRef.current = undefined;
			node = undefined;
		};
	});

	// Attach to & detach from parent
	$effect(() => {
		const parent = parentRef.current;
		const instance = instanceRef.current;
		if (!parent || !instance) return;

		if (!attach && instance.isObject3D) {
			parent.add?.(instance);
			return () => parent.remove?.(instance);
		}

		let key = attach;

		if (!key) {
			if (instance.isBufferGeometry && 'geometry' in parent) key = 'geometry';
			else if (instance.isMaterial && 'material' in parent) key = 'material';
			else return;
		}

		const target = parent as Indexable;
		const previous = target[key];
		target[key] = instance;

		return () => {
			if (target[key] === instance) target[key] = previous;
		};
	});

	// Apply options
	$effect(() => {
		const instance = instanceRef.current as Indexable | undefined;
		if (!instance) return;

		const values = (options ?? {}) as Indexable;
		let originalValues = originals.get(instance);

		if (!originalValues) {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			originalValues = new Map();
			originals.set(instance, originalValues);
		}

		// Restore options that were removed or set to `undefined`
		for (const [key, original] of originalValues) {
			if (values[key] !== undefined) continue;
			applyOption(instance, key, original);
			originalValues.delete(key);
		}

		for (const [key, value] of Object.entries(values)) {
			if (value === undefined) continue;
			const current = instance[key];

			// Method calls can't be undone, only save properties
			if (!isMethodCall(current, value) && !originalValues.has(key)) {
				originalValues.set(
					key,
					// Clone values that are mutated in place
					isCopyable(current) && !current.uuid ? (current.clone?.() ?? current) : current
				);
			}

			applyOption(instance, key, value);
		}
	});
</script>

{@render children?.()}
