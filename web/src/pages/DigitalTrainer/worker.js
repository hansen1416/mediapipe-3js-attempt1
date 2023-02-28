// import { loadJSON } from "../../components/ropes";

let animation_states = null;

export function fetchAnimationData(animation_data) {
	// loadJSON(
	// 	process.env.PUBLIC_URL + "/animjson/" + animation_filename + ".json"
	// ).then((data) => {
	// 	animationData = data;
	// });

	animation_states = animation_data;

	console.log(animation_states);

	return "Animation data received";
}

export function analyzePose(data) {
	if (!animation_states) {
		return "";
	}

	// compare current pose with all frames from the animation
	// todo define a function to abstract limbs position from animations

	if (data && data.length) {
		return `name is, 112312313`;
	}
}
