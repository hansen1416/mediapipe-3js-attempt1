import { useEffect } from "react";

import { loadFBX } from "../../components/ropes";

export default function SiderAnimation({ scene, animation_name, class_name }) {
	useEffect(() => {
		if (scene) {
			Promise.all([
				loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
			]).then(([model]) => {
				console.log(model);
				scene.add(model);
			});
		}

		// eslint-disable-next-line
	}, [scene]);

	return <div data-animation={animation_name} className={class_name}></div>;
}
