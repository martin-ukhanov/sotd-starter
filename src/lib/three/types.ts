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
import type { Ref, RawRef } from '#lib/utils/ref.svelte.ts';

/*
	Context
*/
export interface ThreeSize {
	/** Width of the area being rendered into, in CSS pixels. */
	readonly width: number;
	/** Height of the area being rendered into, in CSS pixels. */
	readonly height: number;
	/** Device pixel ratio used by the renderer. */
	readonly pixelRatio: number;
}

export type ThreeCamera = PerspectiveCamera | OrthographicCamera;

export interface ThreeContext {
	/** Element covering the area being rendered into. */
	readonly domElement: HTMLElement;
	readonly canvas: HTMLCanvasElement;
	readonly size: ThreeSize;
	readonly renderer: WebGLRenderer;
	readonly scene: Scene;
	readonly camera: RawRef<ThreeCamera | undefined>;
	/** Replaces the default scene render. */
	readonly render: RawRef<(() => void) | undefined>;
	/** Whether the area is being rendered. */
	readonly isVisible: Readonly<Ref<boolean>>;
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

export type ThreeLoopSubscribe = (
	callback: ThreeLoopCallback,
	options?: ThreeLoopOptions
) => () => void;

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
/** A rect on the canvas in CSS pixels, from its bottom-left. */
export interface ThreeRect {
	left: number;
	bottom: number;
	width: number;
	height: number;
}

export interface ThreeView extends Pick<
	ThreeContext,
	'domElement' | 'scene' | 'camera' | 'render'
> {
	/** Area of the canvas the view renders into. */
	readonly viewport: ThreeRect;
	/** Visible part of the viewport, once clipped by the element's ancestors. */
	readonly scissor: ThreeRect;
	/** Whether any of the view is visible on the canvas, after clipping. */
	readonly isVisible: Ref<boolean>;
	/** Negative values render below the main scene. Default `0`. */
	renderOrder: number;
	children?: Snippet;
}
