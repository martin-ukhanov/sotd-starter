<script lang="ts" generics="T extends ThreeNodeConstructor">
	import { rawRef, readonlyRef, unref } from '$lib/utils/ref.svelte';
	import { setThreeParent, getThreeParent } from '$three/context';
	import type { Snippet } from 'svelte';
	import type { Vector2, Vector3, Vector4, Euler, Quaternion, Color } from 'three';
	import type { ThreeNodeConstructor } from '$three/types';

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

	const parent = getThreeParent();
	const instance = rawRef<InstanceType<T>>();

	setThreeParent(readonlyRef(instance));

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
		const inst = new is(...(args ?? [])) as InstanceType<T>;
		instance.current = inst;
		ref = inst;

		return () => {
			if (typeof inst.dispose === 'function') inst.dispose();
			instance.current = undefined;
			ref = undefined;
		};
	});

	// Apply options
	$effect(() => {
		if (!instance.current || !options) return;
		const inst = instance.current as Record<string, unknown>;

		for (const [key, value] of Object.entries(options)) {
			const current = inst[key];

			if (typeof current === 'function') {
				current(...(Array.isArray(value) ? value : [value]));
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
				inst[key] = value;
			}
		}
	});

	// Attach to & detach from parent
	$effect(() => {
		const i = instance.current;
		if (!i) return;

		const p = unref(parent);
		if (!p) return;

		if (attach) {
			(p as Record<string, unknown>)[attach] = i;
		} else if (i.isObject3D && typeof p.add === 'function') {
			p.add(i);
		} else if ((i.isBufferGeometry || i.isGeometry) && 'geometry' in p) {
			p.geometry = i;
		} else if (i.isMaterial && 'material' in p) {
			p.material = i;
		}

		return () => {
			if (attach) {
				const pAttach = p as Record<string, unknown>;
				if (pAttach[attach] === i) pAttach[attach] = null;
			} else if (i.isObject3D && typeof p.remove === 'function') {
				p.remove(i);
			} else if ((i.isBufferGeometry || i.isGeometry) && p.geometry === i) {
				p.geometry = null;
			} else if (i.isMaterial && p.material === i) {
				p.material = null;
			}
		};
	});
</script>

{@render children?.()}
