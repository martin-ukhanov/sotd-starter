import { utils, createTimeline, type DOMTargetsParam } from 'animejs';

export interface HorizontalLoopOptions {
	targets: DOMTargetsParam;
	speed: number;
	reversed?: boolean;
}

export function horizontalLoop({ targets, speed, reversed }: HorizontalLoopOptions) {
	const itemEls = utils.$(targets) as HTMLElement[];
	if (!itemEls.length) return;

	const snap = utils.snap(1);
	const pixelsPerMs = speed / 1000;

	const startX = itemEls[0].offsetLeft;
	const lastItem = itemEls[itemEls.length - 1];
	const totalWidth = lastItem.offsetLeft + lastItem.offsetWidth - startX;
	const itemWidths = itemEls.map((item) => utils.get(item, 'width', false));

	const tl = createTimeline({
		defaults: { ease: 'none' },
		loop: true,
		reversed
	});

	itemEls.forEach((itemEl, i) => {
		const itemWidth = itemWidths[i];
		const distanceToLoop = itemEl.offsetLeft + itemWidth - startX;
		const remainingDistance = -distanceToLoop + totalWidth;

		const xIn = `${snap((remainingDistance / itemWidth) * 100)}%`;
		const xOut = `${snap((-distanceToLoop / itemWidth) * 100)}%`;

		const durationIn = remainingDistance / pixelsPerMs;
		const durationOut = distanceToLoop / pixelsPerMs;

		tl.add(
			itemEl,
			{
				x: xOut,
				duration: durationOut
			},
			0
		).add(
			itemEl,
			{
				x: [xIn, '0%'],
				duration: durationIn
			},
			durationOut
		);
	});

	return tl;
}
