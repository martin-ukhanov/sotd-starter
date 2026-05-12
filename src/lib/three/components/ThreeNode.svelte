<script lang="ts" generics="T extends ThreeNodeConstructor">
	import { ref as _ref } from '$lib/utils/ref.svelte';
	import { setThreeParent, getThreeParent } from '$lib/three/context';
	import type { Snippet } from 'svelte';
	import type { Vector2, Vector3, Vector4, Euler, Quaternion, Color } from 'three';
	import type { ThreeNodeConstructor } from '$lib/three/types';

	type MathTuple<T> = T extends Vector2
		? [number, number]
		: T extends Vector3
			? [number, number, number]
			: T extends Vector4
				? [number, number, number, number]
				: T extends Euler
					? [number, number, number, string?]
					: T extends Quaternion
						? [number, number, number, number]
						: T extends Color
							? number | [number, number, number] | string
							: never;

	type PropOrTuple<T> = [MathTuple<T>] extends [never] ? T : T | MathTuple<T>;

	type ThreeNodeOptions<T> = {
		[K in keyof T]?: T[K] extends (...args: infer A) => unknown ? A : PropOrTuple<T[K]>;
	};

	type Settable = { set: (...args: unknown[]) => unknown };
	type Copyable = { copy: (value: unknown) => unknown; uuid?: unknown };

	let {
		is,
		args,
		options,
		attach,
		ref = $bindable(),
		children
	}: {
		is: T;
		args?: ConstructorParameters<T>;
		options?: ThreeNodeOptions<InstanceType<T>>;
		attach?: string;
		ref?: InstanceType<T>;
		children?: Snippet;
	} = $props();

	const parentRef = getThreeParent();
	const instanceRef = _ref.raw<InstanceType<T>>();

	setThreeParent(_ref.readonly(instanceRef));

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

	// Create instance
	$effect(() => {
		const instance = new is(...(args ?? [])) as InstanceType<T>;
		instanceRef.current = instance;
		ref = instance;

		return () => {
			if (typeof instance.dispose === 'function') instance.dispose();
			instanceRef.current = undefined;
			ref = undefined;
		};
	});

	// Apply options
	$effect(() => {
		if (!instanceRef.current || !options) return;
		const instance = instanceRef.current as Record<string, unknown>;

		for (const [key, value] of Object.entries(options)) {
			const current = instance[key];

			if (typeof current === 'function') {
				(instance[key] as (...a: unknown[]) => unknown)(
					...(Array.isArray(value) ? value : [value])
				);
			} else if (Array.isArray(value) && isSettable(current)) {
				current.set(...value);
			} else if (isSettable(current) && (typeof value === 'number' || typeof value === 'string')) {
				current.set(value);
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
		const instance = instanceRef.current;
		const parent = parentRef.current;

		if (!instance || !parent) return;

		if (attach) {
			(parent as Record<string, unknown>)[attach] = instance;
		} else if (instance.isObject3D && typeof parent.add === 'function') {
			parent.add(instance);
		} else if ((instance.isBufferGeometry || instance.isGeometry) && 'geometry' in parent) {
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
			} else if (
				(instance.isBufferGeometry || instance.isGeometry) &&
				parent.geometry === instance
			) {
				parent.geometry = null;
			} else if (instance.isMaterial && parent.material === instance) {
				parent.material = null;
			}
		};
	});
</script>

{@render children?.()}
