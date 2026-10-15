import type { Snippet } from 'svelte';
import type {
	WebGLRenderer,
	Scene,
	Camera,
	Vector2,
	Vector3,
	Vector4,
	Euler,
	Quaternion,
	Color
} from 'three';
import type { Ref } from '#lib/utils/ref.svelte.ts';

/*
	Viewport
*/
export interface ThreeViewport {
	readonly width: number;
	readonly height: number;
	readonly pixelRatio: number;
}

/*
	Context
*/
export interface ThreeContext {
	readonly canvas: HTMLCanvasElement;
	readonly renderer: WebGLRenderer;
	readonly scene: Scene;
	readonly camera: Ref<Camera | undefined>;
	readonly viewport: ThreeViewport;
}

/*
	Loop
*/
export interface ThreeLoopState {
	readonly delta: number;
	readonly elapsed: number;
}

export type ThreeLoopStage = 'beforeRender' | 'render' | 'afterRender';
export type ThreeLoopCallback = (state: ThreeLoopState) => void;

export interface ThreeLoopOptions {
	stage?: ThreeLoopStage;
	order?: number;
}

export type ThreeLoopUnsubscribe = () => void;

export type ThreeLoopSubscribe = (
	callback: ThreeLoopCallback,
	options?: ThreeLoopOptions
) => ThreeLoopUnsubscribe;

/*
	Node
*/
export type ThreeNodeConstructor = new (...args: never[]) => object;

// Like `ConstructorParameters`, but includes up to 4 overloads instead of only the last
export type ThreeNodeArgs<T> = T extends {
	new (...args: infer A1): unknown;
	new (...args: infer A2): unknown;
	new (...args: infer A3): unknown;
	new (...args: infer A4): unknown;
}
	? A1 | A2 | A3 | A4
	: never;

type MathTuple<T> = T extends Vector2
	? number | [number, number]
	: T extends Vector3
		? number | [number, number, number]
		: T extends Vector4
			? number | [number, number, number, number]
			: T extends Euler
				? [number, number, number, string?]
				: T extends Quaternion
					? [number, number, number, number]
					: T extends Color
						? number | [number, number, number] | string
						: never;

type PropOrTuple<T> = [MathTuple<T>] extends [never] ? T : T | MathTuple<T>;

export type ThreeNodeOptions<T> = {
	[K in keyof T]?: T[K] extends (...args: infer A) => unknown ? A | T[K] : PropOrTuple<T[K]>;
};

export interface ThreeNode {
	isObject3D?: boolean;
	isBufferGeometry?: boolean;
	isMaterial?: boolean;
	add?(node: ThreeNode): void;
	remove?(node: ThreeNode): void;
	dispose?(): void;
}

/*
	View
*/
export interface ThreeViewRect {
	left: number;
	bottom: number;
	width: number;
	height: number;
}

export interface ThreeView {
	domElement: HTMLElement;
	scene: Scene;
	camera?: Camera;
	rect?: ThreeViewRect;
	isIntersecting: boolean;
	/** Lower values render first. Negative values render below the main scene. Default `0`. */
	renderOrder: number;
	render?: () => void;
	children?: Snippet;
}

type ThreeViewWritable = 'camera' | 'render';

export type ThreeViewContext = Readonly<Omit<ThreeView, ThreeViewWritable | 'rect'>> &
	Pick<ThreeView, ThreeViewWritable> & {
		readonly rect?: Readonly<ThreeViewRect>;
	};
