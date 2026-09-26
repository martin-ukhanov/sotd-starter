import type { Snippet } from 'svelte';
import type { Ref } from '$lib/utils/ref.svelte';
import type { WebGLRenderer, Scene, Camera } from 'three';

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
	priority?: number;
}

export type ThreeLoopUnsubscribe = () => void;

export type ThreeLoopSubscribe = (
	callback: ThreeLoopCallback,
	options?: ThreeLoopOptions
) => ThreeLoopUnsubscribe;

/*
	Node
*/
export interface ThreeNode {
	isObject3D?: boolean;
	isBufferGeometry?: boolean;
	isMaterial?: boolean;
	geometry?: unknown;
	material?: unknown;
	add?(node: ThreeNode): void;
	remove?(node: ThreeNode): void;
	dispose?(): void;
}

export type ThreeNodeConstructor = new (...args: never[]) => ThreeNode;

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
	children?: Snippet;
	rect?: ThreeViewRect;
	isIntersecting?: boolean;
	renderBelow?: boolean;
	render?: () => void;
}

type ThreeViewWritable = 'camera' | 'render';

export type ThreeViewContext = Readonly<Omit<ThreeView, ThreeViewWritable | 'rect'>> &
	Pick<ThreeView, ThreeViewWritable> & {
		readonly rect?: Readonly<ThreeViewRect>;
	};
