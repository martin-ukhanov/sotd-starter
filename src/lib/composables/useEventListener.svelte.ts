import { on } from 'svelte/events';

// Type
export type EventHandler<TTarget extends EventTarget, TEvent extends Event> = (
	this: TTarget,
	event: TEvent & { currentTarget: TTarget }
) => unknown;

// Overloads
export function useEventListener<TEvent extends keyof WindowEventMap>(
	target: Window | (() => Window),
	event: TEvent,
	handler: EventHandler<Window, WindowEventMap[TEvent]>,
	options?: AddEventListenerOptions
): void;

export function useEventListener<TEvent extends keyof DocumentEventMap>(
	target: Document | (() => Document),
	event: TEvent,
	handler: EventHandler<Document, DocumentEventMap[TEvent]>,
	options?: AddEventListenerOptions
): void;

export function useEventListener<
	TElement extends HTMLElement,
	TEvent extends keyof HTMLElementEventMap
>(
	target: TElement | (() => TElement),
	event: TEvent,
	handler: EventHandler<TElement, HTMLElementEventMap[TEvent]>,
	options?: AddEventListenerOptions
): void;

export function useEventListener<TEvent extends keyof MediaQueryListEventMap>(
	target: MediaQueryList | (() => MediaQueryList),
	event: TEvent,
	handler: EventHandler<MediaQueryList, MediaQueryListEventMap[TEvent]>,
	options?: AddEventListenerOptions
): void;

export function useEventListener(
	target: EventTarget | (() => EventTarget),
	event: string,
	handler: EventListener,
	options?: AddEventListenerOptions
): void;

// Implementation
export function useEventListener(
	target: EventTarget | (() => EventTarget),
	event: string,
	handler: EventListener,
	options?: AddEventListenerOptions
) {
	$effect(() => on(typeof target === 'function' ? target() : target, event, handler, options));
}
