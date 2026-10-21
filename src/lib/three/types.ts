import type { Snippet } from 'svelte';
import type {
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	OrthographicCamera,
	Vector2,
	Vector3,
	Vector4,
	Euler,
	Quaternion,
	Color
} from 'three';
import type { Ref } from '#lib/utils/ref.svelte.ts';

/*
	Context
*/
export interface ThreeSize {
	/** Canvas width in CSS pixels. */
	readonly width: number;
	/** Canvas height in CSS pixels. */
	readonly height: number;
	/** Device pixel ratio used by the renderer. */
	readonly pixelRatio: number;
}

export type ThreeCamera = PerspectiveCamera | OrthographicCamera;

export interface ThreeContext {
	readonly canvas: HTMLCanvasElement;
	readonly renderer: WebGLRenderer;
	readonly size: ThreeSize;
	readonly scene: Scene;
	readonly camera: Ref<ThreeCamera | undefined>;
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
export interface ThreeView {
	readonly domElement: HTMLElement;
	readonly scene: Scene;
	camera?: ThreeCamera;
	/** Area of the canvas the view renders into, in CSS pixels from the bottom-left corner. */
	readonly viewport: { left: number; bottom: number; width: number; height: number };
	/** Whether the view overlaps the canvas. */
	isVisible: boolean;
	/** Lower values render first. Negative values render below the main scene. Default `0`. */
	renderOrder: number;
	/** Replaces the default scene render. Viewport and scissor are already set to the view. */
	render?: () => void;
	children?: Snippet;
}

export type ThreeViewContext = Readonly<Pick<ThreeView, 'domElement' | 'scene' | 'isVisible'>> &
	Pick<ThreeView, 'camera' | 'render'> & {
		readonly viewport: Readonly<ThreeView['viewport']>;
	};
