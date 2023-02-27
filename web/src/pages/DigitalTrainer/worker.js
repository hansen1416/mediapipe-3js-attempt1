// import { loadJSON } from "../../components/ropes";

let animationData = null;

export function fetchAnimationData(animation_data) {
	// loadJSON(
	// 	process.env.PUBLIC_URL + "/animjson/" + animation_filename + ".json"
	// ).then((data) => {
	// 	animationData = data;
	// });

	animationData = animation_data;

	return "Animation data received";
}

export function analyzePose(data) {
	if (!animationData) {
		return "";
	}

	if (data && data.length) {
		return `name is, ${animationData.name}`;
	}
}
