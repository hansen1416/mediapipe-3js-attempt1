import { useEffect, useRef, useState } from "react";

import { box, startCamera } from "../../components/ropes";

export default function SiderAnimation({ scene, animation_name, class_name }) {
	useEffect(() => {
		if (scene) {
			const b = box(50);

			b.position.set(0, 0, 0);

			scene.add(b);
		}

		// eslint-disable-next-line
	}, [scene]);

	return <div data-animation={animation_name} className={class_name}></div>;
}
