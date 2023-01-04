import * as THREE from "three";
import { Group, Vector3, Matrix4, MathUtils } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { POSE_LANDMARKS } from "@mediapipe/pose";
import { Quaternion } from "three";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const BlazePoseConfig = {
	// runtime: "mediapipe", // or 'tfjs'
	runtime: "tfjs",
	enableSmoothing: true,
	modelType: "full",
	detectorModelUrl:
		process.env.PUBLIC_URL +
		"/models/tfjs-model_blazepose_3d_detector_1/model.json",
	landmarkModelUrl:
		process.env.PUBLIC_URL +
		"/models/tfjs-model_blazepose_3d_landmark_full_2/model.json",
	// solutionPath: process.env.PUBLIC_URL + `/models/mediapipe/pose`,
};

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

export function posePointsToVector(a, b, norm = true) {
	let v;

	if (a[0]) {
		v = new THREE.Vector3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
	} else {
		v = new THREE.Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
	}

	return norm ? v.normalize() : v;
}

export function middlePosition(a, b, norm = true) {
	let v;

	if (a[0]) {
		v = new THREE.Vector3(
			(a[0] + b[0]) / 2,
			(a[1] + b[1]) / 2,
			(a[2] + b[2]) / 2
		);
	} else {
		v = new THREE.Vector3(
			(a.x + b.x) / 2,
			(a.y + b.y) / 2,
			(a.z + b.z) / 2
		);
	}

	return norm ? v.normalize() : v;
}

export function posePositionToVector(a, b) {
	return new THREE.Vector3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
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

/**
 * save reference for different body parts
 * @param {*} model
 */
export function travelModel(model, bodyparts) {
	for (let name in bodyparts) {
		if (name === model.name) {
			bodyparts[name] = model;
		}
	}

	model.children.forEach((child) => {
		// console.log(child)
		travelModel(child, bodyparts);
	});
}

export function traverseModel(model, bodyParts) {
	if (model && model.isBone && model.children.length) {
		// console.log(model.name, model.children.length)
		bodyParts[model.name] = model;
	}
	// console.log(model, model.name, model.matrix);

	model.children.forEach((child) => {
		traverseModel(child, bodyParts);
	});
}

export function getUpVectors(model, bodyParts) {
	if (model && model.isBone && model.children.length) {
		// console.log(model.name, model.children.length)
		bodyParts[model.name] = model.up;
	}
	// console.log(model, model.name, model.matrix);

	model.children.forEach((child) => {
		getUpVectors(child, bodyParts);
	});
}

/**
 * a grpah of all parent objects
 * @param {*} model
 * @param {*} bodyParts
 */
export function modelInheritGraph(model, bodyParts) {
	if (model && model.isBone) {
		if (model.parent) {
			const raw = [model.parent.name].concat(
				bodyParts[model.parent.name]
			);

			const tree = [];

			for (let v of raw) {
				if (!v || tree.indexOf(v) !== -1 || v === model.name) {
					continue;
				}

				tree.push(v);
			}

			bodyParts[model.name] = tree;
		} else {
			bodyParts[model.name] = [];
		}
	}
	// console.log(model, model.name, model.matrix);

	model.children.forEach((child) => {
		modelInheritGraph(child, bodyParts);
	});
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

export function rect(p0, p1, p2, p3, clr0, clr1, clr2, clr3) {
	return [
		{ pos: Array.from(p0), clr: clr0 ? clr0 : null },
		{ pos: Array.from(p3), clr: clr3 ? clr3 : null },
		{ pos: Array.from(p1), clr: clr1 ? clr1 : null },
		{ pos: Array.from(p2), clr: clr2 ? clr2 : null },
		{ pos: Array.from(p1), clr: clr1 ? clr1 : null },
		{ pos: Array.from(p3), clr: clr3 ? clr3 : null },
	];
}

export function isFloatClose(a, b) {
	return Math.abs(a - b) < 0.000001;
}

export function getEdgeVerticesIndexMapping(
	axis,
	mesh1,
	threshold1,
	mesh2,
	threshold2
) {
	const positionAttribute1 = mesh1.geometry.getAttribute("position");
	const idx1 = [];
	const vex1 = [];

	for (let i = 0; i < positionAttribute1.count; i++) {
		const vertex = new THREE.Vector3();
		vertex.fromBufferAttribute(positionAttribute1, i);

		if (isFloatClose(vertex[axis], threshold1)) {
			idx1.push(i);
			vex1.push(vertex);
		}
	}

	const positionAttribute2 = mesh2.geometry.getAttribute("position");
	const idx2 = [];
	const vex2 = [];

	for (let i = 0; i < positionAttribute2.count; i++) {
		const vertex = new THREE.Vector3();
		vertex.fromBufferAttribute(positionAttribute2, i);

		if (isFloatClose(vertex[axis], threshold2)) {
			idx2.push(i);
			vex2.push(vertex);
		}
	}

	const dimen = ["x", "y", "z"].filter((x) => x !== axis);

	const mapping = {};
	// mesh1 is to be updated, following mesh2
	for (let i in vex1) {
		for (let j in vex2) {
			if (
				isFloatClose(vex1[i][dimen[0]], vex2[j][dimen[0]]) &&
				isFloatClose(vex1[i][dimen[1]], vex2[j][dimen[1]])
			) {
				mapping[idx1[i]] = idx2[j];

				break;
			}
		}
	}

	return [idx1, idx2, mapping];
}

export function loadGLTF(url) {
	return new Promise((resolve) => {
		const loader = new GLTFLoader();
		loader.load(url, (gltf) => resolve(gltf));
	});
}

export function loadFBX(url) {
	return new Promise((resolve) => {
		const loader = new FBXLoader();
		loader.load(url, (fbx) => resolve(fbx));
	});
}

export function loadObj(url) {
	return new Promise((resolve) => {
		fetch(url).then((response) => resolve(response.json()));
	});
}

export function dumpObject(obj, lines = [], isLast = true, prefix = "") {
	const localPrefix = isLast ? "└─" : "├─";
	lines.push(
		`${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${
			obj.type
		}]`
	);
	const newPrefix = prefix + (isLast ? "  " : "│ ");
	const lastNdx = obj.children.length - 1;
	obj.children.forEach((child, ndx) => {
		const isLast = ndx === lastNdx;
		dumpObject(child, lines, isLast, newPrefix);
	});
	return lines;
}

export function matrixFromPoints(a, b, c) {
	const axis1 = new THREE.Vector3(
		a.x - b.x,
		a.y - b.y,
		a.z - b.z
	).normalize();
	const axis2 = new THREE.Vector3(
		c.x - b.x,
		c.y - b.y,
		c.z - b.z
	).normalize();

	return new THREE.Matrix4().makeBasis(
		axis1,
		axis2,
		new THREE.Vector3().crossVectors(axis1, axis2).normalize()
	);
}

export function quaternionFromPositions(a1, b1, c1, a2, b2, c2) {
	return new THREE.Quaternion().setFromRotationMatrix(
		matrixFromPoints(a2, b2, c2).multiply(
			matrixFromPoints(a1, b1, c1).invert()
		)
	);
}

export function box(size = 0.1, color = 0xffffff) {
	const material = new THREE.MeshBasicMaterial({ color: color });
	const geo = new THREE.BoxGeometry(size, size, size);

	return new THREE.Mesh(geo, material);
}

export function line(a, b, color = 0xffffff) {
	const c = b.clone().sub(a);

	const geometry = new THREE.BufferGeometry().setFromPoints([
		new THREE.Vector3(0, 0, 0),
		c,
	]);

	geometry.setDrawRange(0, 2);

	const line = new THREE.Line(
		geometry,
		new THREE.LineBasicMaterial({ color: color })
	);

	line.position.set(a.x, a.y, a.z);

	return line;
}

export function unitline(a, b, color = 0xffffff) {
	const c = b.clone().sub(a);

	const geometry = new THREE.BufferGeometry().setFromPoints([
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(c.length(), 0, 0),
	]);

	geometry.setDrawRange(0, 2);

	const line = new THREE.Line(
		geometry,
		new THREE.LineBasicMaterial({ color: color })
	);

	line.position.set(a.x, a.y, a.z);

	return line;
}

/**
 * read data from animations
 * munnually assign translation and rotation to model
 * @param {*} model
 * @param {*} animation
 * @param {*} indx
 */
export function applyTransfer(model, animation, indx) {
	for (let item of Object.values(animation)) {
		const item_name = item["name"].split(".")[0];

		if (!model[item_name]) {
			continue;
		}

		if (item["type"] === "vector") {
			if (indx < item["vectors"].length) {
				model[item_name].position.set(
					item["vectors"][indx].x,
					item["vectors"][indx].y,
					item["vectors"][indx].z
				);
			} else {
				model[item_name].position.set(
					item["vectors"][item["vectors"].length - 1].x,
					item["vectors"][item["vectors"].length - 1].y,
					item["vectors"][item["vectors"].length - 1].z
				);
			}
		}

		if (item["type"] === "quaternion") {
			let q =
				indx < item["quaternions"].length
					? item["quaternions"][indx]
					: item["quaternions"][item["quaternions"].length - 1];

			if (!(q instanceof Quaternion)) {
				q = new Quaternion(q._x, q._y, q._z, q._w);
			}

			model[item_name].setRotationFromQuaternion(q);
		}
	}
}

/**
 * blender uses right hand coordinate system with the
 * Z axis pointing upwards.
 * Y axis pointing backwards.
 * X axis pointing to the right
 *
 * it means we have to negate the X and Y angle,
 * and swap Y and Z angles
 * @param {*} x
 * @param {*} y
 * @param {*} z
 */
export function bvhToQuaternion(x, y, z) {
	const order = "ZXY";

	return new THREE.Quaternion().setFromEuler(
		new THREE.Euler(
			THREE.MathUtils.degToRad(x),
			THREE.MathUtils.degToRad(z),
			THREE.MathUtils.degToRad(y),
			order
		)
	);
}

export function startCamera(videoElement) {
	getUserMedia(
		{ video: true },
		(stream) => {
			// Yay, now our webcam input is treated as a normal video and
			// we can start having fun
			try {
				videoElement.srcObject = stream;

				// let stream_settings = stream
				// 	.getVideoTracks()[0]
				// 	.getSettings();

				// console.log(stream_settings);
			} catch (error) {
				videoElement.src = URL.createObjectURL(stream);
			}
			// Let's start drawing the canvas!
		},
		(err) => {
			throw err;
		}
	);
}

export function projectedDistance(a, b) {
	return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5;
}

export function compareArms(poseData, animationObj, animationIndex) {
	const left_shoulder = poseToVector(
		poseData[BlazePoseKeypointsValues["LEFT_SHOULDER"]]
	);
	const left_elbow = poseToVector(
		poseData[BlazePoseKeypointsValues["LEFT_ELBOW"]]
	);
	const left_wrist = poseToVector(
		poseData[BlazePoseKeypointsValues["LEFT_WRIST"]]
	);

	const right_shoulder = poseToVector(
		poseData[BlazePoseKeypointsValues["RIGHT_SHOULDER"]]
	);
	const right_elbow = poseToVector(
		poseData[BlazePoseKeypointsValues["RIGHT_ELBOW"]]
	);
	const right_wrist = poseToVector(
		poseData[BlazePoseKeypointsValues["RIGHT_WRIST"]]
	);

	// const basisMatrix = getBasisFromPose(poseData);

	// left_elbow.applyMatrix4(basisMatrix);
	// left_shoulder.applyMatrix4(basisMatrix);
	// left_wrist.applyMatrix4(basisMatrix);

	// right_elbow.applyMatrix4(basisMatrix);
	// right_shoulder.applyMatrix4(basisMatrix);
	// right_wrist.applyMatrix4(basisMatrix);

	const leftArmOrientation = posePointsToVector(left_elbow, left_shoulder);
	const leftForeArmOrientation = posePointsToVector(left_wrist, left_elbow);

	const rightArmOrientation = posePointsToVector(right_elbow, right_shoulder);
	const rightForeArmOrientation = posePointsToVector(
		right_wrist,
		right_elbow
	);

	let leftArmStates, leftForeArmStates, rightArmStates, rightForeArmStates;

	if (true) {
		leftArmStates =
			animationObj["LeftArm.quaternion"]["states"][animationIndex];
		leftForeArmStates =
			animationObj["LeftForeArm.quaternion"]["states"][animationIndex];

		rightArmStates =
			animationObj["RightArm.quaternion"]["states"][animationIndex];
		rightForeArmStates =
			animationObj["RightForeArm.quaternion"]["states"][animationIndex];
	} else {
		leftArmStates =
			animationObj["mixamorigLeftArm.quaternion"]["states"][
				animationIndex
			];
		leftForeArmStates =
			animationObj["mixamorigLeftForeArm.quaternion"]["states"][
				animationIndex
			];

		rightArmStates =
			animationObj["mixamorigRightArm.quaternion"]["states"][
				animationIndex
			];
		rightForeArmStates =
			animationObj["mixamorigRightForeArm.quaternion"]["states"][
				animationIndex
			];
	}

	const res = [];

	if (true) {
		const thre = 0.5;
		let score = 0;

		if (projectedDistance(leftArmOrientation, leftArmStates) < thre) {
			res.push("leftArm");
			score += 1;
		}

		if (
			projectedDistance(leftForeArmOrientation, leftForeArmStates) < thre
		) {
			score += 1;
			res.push("leftForeArm");
		}

		if (projectedDistance(rightArmOrientation, rightArmStates) < thre) {
			score += 1;
			res.push("rightArm");
		}

		if (
			projectedDistance(rightForeArmOrientation, rightForeArmStates) <
			thre
		) {
			score += 1;
			res.push("rightForeArm");
		}

		if (true) {
			return score;
		} else {
			return res;
		}
	}

	const leftArmDeviation = leftArmOrientation.angleTo(
		new Vector3(leftArmStates.x, leftArmStates.y, leftArmStates.z)
	);
	const leftForeArmDeviation = leftForeArmOrientation.angleTo(
		new Vector3(
			leftForeArmStates.x,
			leftForeArmStates.y,
			leftForeArmStates.z
		)
	);

	const rightArmDeviation = rightArmOrientation.angleTo(
		new Vector3(rightArmStates.x, rightArmStates.y, rightArmStates.z)
	);
	const rightForeArmDeviation = rightForeArmOrientation.angleTo(
		new Vector3(
			rightForeArmStates.x,
			rightForeArmStates.y,
			rightForeArmStates.z
		)
	);

	const threshold = MathUtils.degToRad(30);

	if (leftArmDeviation < threshold) {
		res.push("leftArm");
	}

	if (leftForeArmDeviation < threshold) {
		res.push("leftForeArm");
	}

	if (rightArmDeviation < threshold) {
		res.push("rightArm");
	}

	if (rightForeArmDeviation < threshold) {
		res.push("rightForeArm");
	}

	return res;
}

export function poseToVector(p, z) {
	if (z) {
		return new Vector3(p.x, p.y, z);
	} else {
		return new Vector3(p.x, p.y, p.z);
	}
}

export function drawPoseKeypoints(keypoints, z_value) {
	const g = new Group();

	const visibleparts = {};

	for (let point of keypoints) {
		if (point.score > 0.5) {
			const d = box(0.01);

			const z = z_value ? z_value : point.z;

			d.position.set(point.x, point.y, z);

			g.add(d);

			visibleparts[point.name] = new Vector3(point.x, point.y, z);
		}
	}

	const pairs = [
		["left_eye", "nose"],
		["right_eye", "nose"],
		["left_shoulder", "right_shoulder"],
		["left_shoulder", "left_elbow"],
		["left_elbow", "left_wrist"],
		["right_shoulder", "right_elbow"],
		["right_elbow", "right_wrist"],
		["left_shoulder", "left_hip"],
		["right_shoulder", "right_hip"],
		["left_hip", "right_hip"],
		["left_hip", "left_knee"],
		["left_ankle", "left_knee"],
		["right_hip", "right_knee"],
		["right_ankle", "right_knee"],
	];

	for (let p of pairs) {
		if (visibleparts[p[0]] && visibleparts[p[1]]) {
			const l = line(visibleparts[p[0]], visibleparts[p[1]]);

			g.add(l);
		}
	}

	return g;
}

export const BlazePoseKeypoints = {
	0: "NOSE",
	1: "LEFT_EYE_INNER",
	2: "LEFT_EYE",
	3: "LEFT_EYE_OUTER",
	4: "RIGHT_EYE_INNER",
	5: "RIGHT_EYE",
	6: "RIGHT_EYE_OUTER",
	7: "LEFT_EAR",
	8: "RIGHT_EAR",
	9: "LEFT_RIGHT",
	10: "RIGHT_LEFT",
	11: "LEFT_SHOULDER",
	12: "RIGHT_SHOULDER",
	13: "LEFT_ELBOW",
	14: "RIGHT_ELBOW",
	15: "LEFT_WRIST",
	16: "RIGHT_WRIST",
	17: "LEFT_PINKY",
	18: "RIGHT_PINKY",
	19: "LEFT_INDEX",
	20: "RIGHT_INDEX",
	21: "LEFT_THUMB",
	22: "RIGHT_THUMB",
	23: "LEFT_HIP",
	24: "RIGHT_HIP",
	25: "LEFT_KNEE",
	26: "RIGHT_KNEE",
	27: "LEFT_ANKLE",
	28: "RIGHT_ANKLE",
	29: "LEFT_HEEL",
	30: "RIGHT_HEEL",
	31: "LEFT_FOOT_INDEX",
	32: "RIGHT_FOOT_INDEX",
};

export const BlazePoseKeypointsValues = {
	NOSE: 0,
	LEFT_EYE_INNER: 1,
	LEFT_EYE: 2,
	LEFT_EYE_OUTER: 3,
	RIGHT_EYE_INNER: 4,
	RIGHT_EYE: 5,
	RIGHT_EYE_OUTER: 6,
	LEFT_EAR: 7,
	RIGHT_EAR: 8,
	LEFT_RIGHT: 9,
	RIGHT_LEFT: 10,
	LEFT_SHOULDER: 11,
	RIGHT_SHOULDER: 12,
	LEFT_ELBOW: 13,
	RIGHT_ELBOW: 14,
	LEFT_WRIST: 15,
	RIGHT_WRIST: 16,
	LEFT_PINKY: 17,
	RIGHT_PINKY: 18,
	LEFT_INDEX: 19,
	RIGHT_INDEX: 20,
	LEFT_THUMB: 21,
	RIGHT_THUMB: 22,
	LEFT_HIP: 23,
	RIGHT_HIP: 24,
	LEFT_KNEE: 25,
	RIGHT_KNEE: 26,
	LEFT_ANKLE: 27,
	RIGHT_ANKLE: 28,
	LEFT_HEEL: 29,
	RIGHT_HEEL: 30,
	LEFT_FOOT_INDEX: 31,
	RIGHT_FOOT_INDEX: 32,
};

export const MoveNetKeypoints = {
	nose: 0,
	left_eye: 1,
	right_eye: 2,
	left_ear: 3,
	right_ear: 4,
	left_shoulder: 5,
	right_shoulder: 6,
	left_elbow: 7,
	right_elbow: 8,
	left_wrist: 9,
	right_wrist: 10,
	left_hip: 11,
	right_hip: 12,
	left_knee: 13,
	right_knee: 14,
	left_ankle: 15,
	right_ankle: 16,
};

export function getBasisFromPose(poseData) {
	if (
		poseData[BlazePoseKeypointsValues["LEFT_SHOULDER"]].score < 0.5 ||
		poseData[BlazePoseKeypointsValues["RIGHT_SHOULDER"]].score < 0.5 ||
		poseData[BlazePoseKeypointsValues["LEFT_HIP"]].score < 0.5 ||
		poseData[BlazePoseKeypointsValues["RIGHT_HIP"]].score < 0.5
	) {
		return new Matrix4();
	}

	const rightshoulder = new Vector3(
		poseData[BlazePoseKeypointsValues["LEFT_SHOULDER"]].x,
		poseData[BlazePoseKeypointsValues["LEFT_SHOULDER"]].y,
		poseData[BlazePoseKeypointsValues["LEFT_SHOULDER"]].z
	).normalize();
	const leftshoulder = new Vector3(
		poseData[BlazePoseKeypointsValues["RIGHT_SHOULDER"]].x,
		poseData[BlazePoseKeypointsValues["RIGHT_SHOULDER"]].y,
		poseData[BlazePoseKeypointsValues["RIGHT_SHOULDER"]].z
	).normalize();

	const righthip = new Vector3(
		poseData[BlazePoseKeypointsValues["LEFT_HIP"]].x,
		poseData[BlazePoseKeypointsValues["LEFT_HIP"]].y,
		poseData[BlazePoseKeypointsValues["LEFT_HIP"]].z
	).normalize();
	const lefthip = new Vector3(
		poseData[BlazePoseKeypointsValues["RIGHT_HIP"]].x,
		poseData[BlazePoseKeypointsValues["RIGHT_HIP"]].y,
		poseData[BlazePoseKeypointsValues["RIGHT_HIP"]].x
	).normalize();

	const a = middlePosition(leftshoulder, rightshoulder, false);
	const b = middlePosition(lefthip, righthip, false);

	/**
	 * here we use shoulder and the middle of hip as base
	 * also right shoulder as the direction of x, since left and right are flipped in blazepose
	 * note that the `originBasis` must use (0,-1,0) as y direction,
	 * otherwise the pose will be upside down
	 */
	const y_basis = posePointsToVector(b, a);
	const x_basis = posePointsToVector(rightshoulder, a);
	// const x_basis = posePointsToVector(leftshoulder, a);
	const z_basis = new Vector3().crossVectors(x_basis, y_basis).normalize();

	// console.log("x_basis", x_basis, "y_basis", y_basis, "z_basis", z_basis);

	const originBasis = new Matrix4().makeBasis(
		new Vector3(1, 0, 0),
		new Vector3(0, -1, 0),
		new Vector3(0, 0, 1)
	);
	return originBasis.multiply(
		new Matrix4().makeBasis(x_basis, y_basis, z_basis).invert()
	);
}

export function removeObject3D(object) {
	if (!(object instanceof THREE.Object3D)) return false;

	if (object.children && object.children.length) {
		for (let i in object.children) {
			removeObject3D(object.children[i]);
		}
	}

	// for better memory management and performance
	if (object.geometry) {
		object.geometry.dispose();
	}
	if (object.material) {
		if (object.material instanceof Array) {
			// for better memory management and performance
			object.material.forEach((material) => material.dispose());
		} else {
			// for better memory management and performance
			object.material.dispose();
		}
	}
	if (object.parent) {
		object.parent.remove(object);
	}
	// the parent might be the scene or another Object3D, but it is sure to be removed this way
	return true;
}

// function getAnimationState(animationTracks, inheritGraph, upVectors) {
// 	for (let [name, tracks] of Object.entries(animationTracks)) {

// 		if (tracks['type'] !== 'quaternion') {
// 			continue;
// 		}

// 		const states = []

// 		for (let i in tracks['quaternions']) {

// 			const v = upVectors[name].clone();

// 			for (let p = inheritGraph[name].length-1; p >= 0; p--) {
// 				const parent_name = inheritGraph[name][p];

// 				v.applyQuaternion(animationTracks[parent_name]['quaternions'][i]);
// 			}

// 			v.applyQuaternion(tracks['quaternions'][i]);

// 			states.push(v);
// 		}

// 		// console.log(name, tracks);

// 		// console.log(states);

// 		tracks['states'] = states
// 	}
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

/**
 * HAND_LANDMARK
 * 
0. WRIST
1. THUMB_CMC
2. THUMB_MCP
3. THUNB_IP
4. THUNB_TIP
5. INDEX_FINGER_MCP
6. INDEX_FINGER_PIP
7. INDEX_FINGER_DIP
8. INDEX_FINGER_TIP
9. MIDDLE_FINGER_MCP
10. MIDDLE_FINGER_PIP
11. MIDDLE_FINGER_DIP
12. MIDDLE_FINGER_TIP
13. RING_FINGER_MCP
14. RING_FINGER_PIP
15. RING_FINGER_DIP
16. RING_FINGER_TIP
17. PINKY_MCP
18. PINKY_PIP
19. PINKY_DIP
20. PINKY_TIP
 */
