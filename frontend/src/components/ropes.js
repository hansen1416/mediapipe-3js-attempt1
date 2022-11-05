import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";

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

export function posePointsToVector(a, b) {
	return new THREE.Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function distanceBetweenPoints(a, b) {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

export function magnitude(a) {
	return Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
}

export function normalizeVector(a) {
	const m = magnitude(a);
	return [a[0] / m, a[1] / m, a[2] / m];
}

export function crossProduct(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0],
	];
}

export function rotationMatrix(a, b) {
	const c = normalizeVector(crossProduct(a, b));

	return [
		[a[0], c[0], b[0]],
		[a[1], c[1], b[1]],
		[a[2], c[2], b[2]],
	];
}

export function rotationEuler(a, b) {
	a = normalizeVector(a);
	b = normalizeVector(b);

	const matrix = rotationMatrix(a, b);

	return [
		Math.atan2(matrix[2][1], matrix[2][2]),
		Math.atan2(matrix[1][0], matrix[0][0]),
		Math.atan2(
			-1 * matrix[2][0],
			Math.sqrt(matrix[2][1] ** 2 + matrix[2][2] ** 2)
		),
	];
}

export function quaternionFromVectors(a, b) {
	const quaternion = new THREE.Quaternion();

	quaternion.setFromUnitVectors(a.normalize(), b.normalize());

	return quaternion;
}

export const limbs = [
	"LEFT_SHOULDER",
	"RIGHT_SHOULDER",
	"LEFT_ELBOW",
	"RIGHT_ELBOW",
	"LEFT_FOREARM",
	"LEFT_UPPERARM",
	"RIGHT_FOREARM",
	"RIGHT_UPPERARM",
	"LEFT_HIP",
	"RIGHT_HIP",
	"LEFT_THIGH",
	"LEFT_CRUS",
	"LEFT_KNEE",
	"RIGHT_KNEE",
	"RIGHT_THIGH",
	"RIGHT_CRUS",
];

export function getLimbFromPose(limb_name, pose_landmark) {
	let joint1 = "";
	let joint2 = "";

	if (limb_name === "LEFT_UPPERARM") {
		joint1 = "LEFT_SHOULDER";
		joint2 = "LEFT_ELBOW";
	} else if (limb_name === "RIGHT_UPPERARM") {
		joint1 = "RIGHT_SHOULDER";
		joint2 = "RIGHT_ELBOW";
	} else if (limb_name === "LEFT_FOREARM") {
		joint1 = "LEFT_ELBOW";
		joint2 = "LEFT_WRIST";
	} else if (limb_name === "RIGHT_FOREARM") {
		joint1 = "RIGHT_ELBOW";
		joint2 = "RIGHT_WRIST";
	} else if (limb_name === "LEFT_THIGH") {
		joint1 = "LEFT_HIP";
		joint2 = "LEFT_KNEE";
	} else if (limb_name === "RIGHT_THIGH") {
		joint1 = "RIGHT_HIP";
		joint2 = "RIGHT_KNEE";
	} else if (limb_name === "LEFT_CRUS") {
		joint1 = "LEFT_KNEE";
		joint2 = "LEFT_ANKLE";
	} else if (limb_name === "RIGHT_CRUS") {
		joint1 = "RIGHT_KNEE";
		joint2 = "RIGHT_ANKLE";
	}

	return posePointsToVector(
		pose_landmark[POSE_LANDMARKS[joint1]],
		pose_landmark[POSE_LANDMARKS[joint2]]
	);
}

export function hexagonVertices(unit_size, length) {
	return [
		// front
		{ pos: [unit_size, 0, unit_size / 2], norm: [0, 0, 0], uv: [0, 0] },
		{
			pos: [unit_size, length, unit_size / 2],
			norm: [0, 0, 0],
			uv: [0, 0],
		},
		{ pos: [0, length, unit_size], norm: [0, 0, 0], uv: [0, 0] },

		{ pos: [unit_size, 0, unit_size / 2], norm: [0, 0, 0], uv: [0, 0] },
		{ pos: [0, length, unit_size], norm: [0, 0, 0], uv: [0, 0] },
		{ pos: [0, 0, unit_size], norm: [0, 0, 0], uv: [0, 0] },

		{
			pos: [-1 * unit_size, 0, unit_size / 2],
			norm: [0, 0, 0],
			uv: [0, 0],
		},
		{
			pos: [-1 * unit_size, length, unit_size / 2],
			norm: [0, 0, 0],
			uv: [0, 0],
		},
		{ pos: [0, length, unit_size], norm: [0, 0, 0], uv: [0, 0] },

		{
			pos: [-1 * unit_size, 0, unit_size / 2],
			norm: [0, 0, 0],
			uv: [0, 0],
		},
		{ pos: [0, length, unit_size], norm: [0, 0, 0], uv: [0, 0] },
		{ pos: [0, 0, unit_size], norm: [0, 0, 0], uv: [0, 0] },
	];
}

/**
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
 */

// function dumpObject(obj, lines = [], isLast = true, prefix = "") {
// 	const localPrefix = isLast ? "└─" : "├─";
// 	lines.push(
// 		`${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${
// 			obj.type
// 		}]`
// 	);
// 	const newPrefix = prefix + (isLast ? "  " : "│ ");
// 	const lastNdx = obj.children.length - 1;
// 	obj.children.forEach((child, ndx) => {
// 		const isLast = ndx === lastNdx;
// 		dumpObject(child, lines, isLast, newPrefix);
// 	});
// 	return lines;
// }

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
