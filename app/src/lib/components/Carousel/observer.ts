import { iter } from "$lib/utils/collections";

/* eslint-disable no-inner-declarations */
export default function observer(node: HTMLElement) {
	if (IntersectionObserver) {
		const children = node.querySelectorAll("img");

		const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
			for (let idx = 0; idx < entries.length; idx++) {
				const entry = entries[idx];
				const target = entry.target as HTMLImageElement;
				if (entry.isIntersecting) {

					target.loading = "eager";
					target.src = target.dataset.src;
					observer.unobserve(node);
				}

			}
		},
			{ root: node, threshold: 0, rootMargin: "145px 65px" },
		);

		iter(children, (item) => {
			observer.observe(item);
		});

		return {
			destroy() {
				iter(children, (item) => {
					observer.unobserve(item);
				});
			},
		};
	}
}
