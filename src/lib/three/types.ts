import type { WebGLRenderer, Scene, Camera } from 'three';
import type { Ref } from '$lib/utils/ref.svelte';

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
	delta: number;
	elapsed: number;
}

export type ThreeLoopCallback = (state: ThreeLoopState) => void;
export type ThreeLoopStage = 'beforeRender' | 'render' | 'afterRender';

export interface ThreeLoopOptions {
	stage?: ThreeLoopStage;
	priority?: number;
}

export interface ThreeLoop {
	readonly add: (callback: ThreeLoopCallback, options?: ThreeLoopOptions) => void;
	readonly remove: (callback: ThreeLoopCallback) => void;
}

/*
	Node
*/
export interface ThreeNode {
	isObject3D?: boolean;
	isBufferGeometry?: boolean;
	isGeometry?: boolean;
	geometry?: unknown;
	isMaterial?: boolean;
	material?: unknown;
	add?(...args: unknown[]): unknown;
	remove?(...args: unknown[]): unknown;
	dispose?(): void;
}

export type ThreeNodeConstructor = new (...args: never[]) => ThreeNode;
