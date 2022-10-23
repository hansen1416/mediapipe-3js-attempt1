// Integrate navigator.getUserMedia & navigator.mediaDevices.getUserMedia
export function getUserMedia(constraints, successCallback, errorCallback) {
	if (!constraints || !successCallback || !errorCallback) {
		return;
	}

	if (navigator.mediaDevices) {
		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(successCallback, errorCallback);
	} else {
		navigator.getUserMedia(constraints, successCallback, errorCallback);
	}
}

export function degreesToRadians(degrees) {
	return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radian) {
	return (radian / Math.PI) * 180;
}

// export function originToEnd(originPosition, length, rotations) {
// 	return [
// 		originPosition.x + Math.sin(rotations.z) * length,
// 		originPosition.y + Math.cos(rotations.y) * length,
// 		originPosition.z + Math.sin(rotations.z) * length,
// 	];
// }

export function pointsToVector(a, b) {
	return [b.x - a.x, b.y - a.y, b.z - a.z];
}

export function distanceBetweenPoints(a, b) {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

export function magnitude(a) {
	return Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
}

export const joints = [
	"NOSE",
	"LEFT_EYE_INNER",
	"LEFT_EYE",
	"LEFT_EYE_OUTER",
	"RIGHT_EYE_INNER",
	"RIGHT_EYE",
	"RIGHT_EYE_OUTER",
	"LEFT_EAR",
	"RIGHT_EAR",
	"MOUTH_LEFT",
	"MOUTH_RIGHT",
	"LEFT_SHOULDER",
	"RIGHT_SHOULDER",
	"LEFT_ELBOW",
	"RIGHT_ELBOW",
	"LEFT_WRIST",
	"RIGHT_WRIST",
	"LEFT_PINKY",
	"RIGHT_PINKY",
	"LEFT_INDEX",
	"RIGHT_INDEX",
	"LEFT_THUMB",
	"RIGHT_THUMB",
	"LEFT_HIP",
	"RIGHT_HIP",
	"LEFT_KNEE",
	"RIGHT_KNEE",
	"LEFT_ANKLE",
	"RIGHT_ANKLE",
	"LEFT_HEEL",
	"RIGHT_HEEL",
	"LEFT_FOOT_INDEX",
	"RIGHT_FOOT_INDEX",
];

// export function worldPointFromScreenPoint(screenPoint, camera) {
// 	let worldPoint = new THREE.Vector3();
// 	worldPoint.x = screenPoint.x;
// 	worldPoint.y = screenPoint.y;
// 	worldPoint.z = 0;
// 	worldPoint.unproject(camera);
// 	return worldPoint;
// }

// export function onPointerDown(event) {
// 	// Relative screen position
// 	// (WebGL is -1 to 1 left to right, 1 to -1 top to bottom)
// 	const rect = this.dom.getBoundingClientRect();
// 	let viewportDown = new THREE.Vector2();
// 	viewportDown.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
// 	viewportDown.y = -(((event.clientY - rect.top) / rect.height) * 2) + 1;

// 	// Get 3d point
// 	let my3dPosition = worldPointFromScreenPoint(viewportDown, mySceneCamera);
// }
