import { utils, createTimeline, type DOMTargetsParam } from 'animejs';

export interface HorizontalLoopOptions {
	speed?: number;
	reversed?: boolean;
}

export function horizontalLoop(
	targets: DOMTargetsParam,
	{ speed = 100, reversed = false }: HorizontalLoopOptions = {}
) {
	const els = utils.$(targets);
	if (!els.length) return;

	const bounds = els.map((el) => {
		const { left, right } = el.getBoundingClientRect();
		const x = utils.get(el, 'x', false);

		return {
			left: left - x - utils.get(el, 'marginLeft', false),
			right: right - x + utils.get(el, 'marginRight', false)
		};
	});

	const startX = bounds[0].left;
	const totalWidth = bounds[els.length - 1].right - startX;
	const pixelsPerMs = speed / 1000;

	const tl = createTimeline({
		defaults: { ease: 'none' },
		loop: true,
		reversed
	});

	els.forEach((el, i) => {
		const distanceToLoop = bounds[i].right - startX;
		const remainingDistance = totalWidth - distanceToLoop;

		tl.add(
			el,
			{
				x: [0, -distanceToLoop],
				duration: distanceToLoop / pixelsPerMs
			},
			0
		).add(
			el,
			{
				x: [remainingDistance, 0],
				duration: remainingDistance / pixelsPerMs
			},
			distanceToLoop / pixelsPerMs
		);
	});

	return tl;
}
