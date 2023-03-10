import * as THREE from "three";
import { Quaternion } from "three";
// import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

import {
	BlazePoseKeypointsValues,
	posePointsToVector,
	quaternionFromVectors,
	distanceBetweenPoints,
} from "./ropes";
// import MeshLineMaterial from "./MeshLineMaterial";

export default class Silhouette3D {
	/**
	 * todo, work out the math for a proper position of landmark
	 * it should be in good proportion and can change as camera distance change
	 *
	 * use particle for limbs
	 *
	 *
	 */

	limbs_arr = [
		"TORSO",
		"HEAD",
		"LEFT_UPPERARM",
		"LEFT_FOREARM",
		"LEFT_HAND",
		"RIGHT_UPPERARM",
		"RIGHT_FOREARM",
		"RIGHT_HAND",
		"LEFT_THIGH",
		"LEFT_CALF",
		"LEFT_FOOT",
		"RIGHT_THIGH",
		"RIGHT_CALF",
		"RIGHT_FOOT",
	];

	constructor() {
		this.unit = 1;

		this.head_radius = 3 * this.unit;
		this.neck_radius = 1.6 * this.unit;
		this.neck_size = 2 * this.unit;

		this.shoulder_size = 6 * this.unit;
		this.spine_size = 12 * this.unit;
		this.waist_size = 5 * this.unit;

		this.deltoid_radius = 2 * this.unit;
		this.bigarm_size = 8 * this.unit;
		this.elbow_radius = 1.6 * this.unit;

		this.smallarm_size = 8 * this.unit;
		this.wrist_size = 1.2 * this.unit;

		this.thigh_radius = 2.8 * this.unit;
		this.thigh_size = 10 * this.unit;
		this.knee_radius = 2.0 * this.unit;

		this.calf_size = 10 * this.unit;
		this.ankle_radius = 1.6 * this.unit;

		// the initial vector of limbs
		this.init_vector = new THREE.Vector3(0, -1, 0);

		// todo remove this property when i'm sure
		// replace mesh by particles
		this.add_mesh = true;

		this.color = 0x44aa88;

		// opacity of material, when pose score is lower/higher then 0.5
		this.invisible_opacity = 0.3;
		this.visible_opacity = 0.5;
	}

	getLimbMesh(
		radiusTop,
		radiusBottom,
		height,
		radialSegments = 8,
		heightSegments = 1
	) {
		/**
		 * the cylinder for limbs
		 * @param {number} radiusTop
		 * @param {number} radiusBottom
		 * @param {number} height
		 * @param {number} radialSegments
		 * @param {number} heightSegments
		 * @returns
		 */
		const geometry = new THREE.CylinderGeometry(
			radiusTop,
			radiusBottom,
			height,
			radialSegments,
			heightSegments
		);

		const material = new THREE.MeshBasicMaterial({
			color: this.color,
			transparent: true,
			opacity: 0,
		});

		return new THREE.Mesh(geometry, material);
	}

	getTorsoMesh(points) {
		/**
		 * torso plane
		 */
		const geometry = new THREE.BufferGeometry().setFromPoints(points);

		const material = new THREE.MeshBasicMaterial({
			color: this.color,
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide,
		});

		return new THREE.Mesh(geometry, material);
	}

	getBallMesh(radius, widthSegments = 8, heightSegments = 8) {
		/**
		 * a ball
		 */
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, widthSegments, heightSegments),
			new THREE.MeshBasicMaterial({
				color: this.color,
				transparent: true,
				opacity: this.invisible_opacity,
			})
		);
	}

	init() {
		/**
		 * initialize body parts
		 * todo add hands and foot
		 */

		this.body = new THREE.Group();
		// todo separate torso to two parts, chest and abdominal
		this.torso_mesh = new THREE.Mesh(
			new THREE.BoxGeometry(
				(this.shoulder_size * 5) / 3,
				this.spine_size,
				this.deltoid_radius
			),
			new THREE.MeshBasicMaterial({
				color: this.color,
				transparent: true,
				opacity: this.invisible_opacity,
			})
		);

		const axesHelper = new THREE.AxesHelper(30);

		this.torso_mesh.add(axesHelper);

		this.body.add(this.torso_mesh);

		// head
		this.head_mesh = this.getBallMesh(this.head_radius);

		this.head_mesh.position.set(0, this.spine_size, 0);

		this.torso_mesh.add(this.head_mesh);

		// left shoulder
		this.shoulder_l_mesh = this.getBallMesh((this.deltoid_radius * 3) / 2);

		this.shoulder_l_mesh.position.set(
			this.shoulder_size - this.deltoid_radius / 2,
			this.spine_size / 2 - this.deltoid_radius,
			0
		);

		this.torso_mesh.add(this.shoulder_l_mesh);

		// right shoulder
		this.shoulder_r_mesh = this.getBallMesh(this.deltoid_radius);

		this.shoulder_r_mesh.position.set(
			-this.shoulder_size + this.deltoid_radius / 2,
			this.spine_size / 2 - this.deltoid_radius,
			0
		);

		this.torso_mesh.add(this.shoulder_r_mesh);

		return this.body;

		// left upperarm
		this.upperarm_l = new THREE.Group();

		this.upperarm_l_mesh = this.getLimbMesh(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		if (this.add_mesh) {
			this.upperarm_l.add(this.upperarm_l_mesh);
		}
		this.body.add(this.upperarm_l);

		// left lowerarm
		this.lowerarm_l = new THREE.Group();

		this.lowerarm_l_mesh = this.getLimbMesh(
			this.elbow_radius,
			this.wrist_size,
			this.smallarm_size
		);

		if (this.add_mesh) {
			this.lowerarm_l.add(this.lowerarm_l_mesh);
		}
		this.body.add(this.lowerarm_l);

		// right upperarm
		this.upperarm_r = new THREE.Group();

		this.upperarm_r_mesh = this.getLimbMesh(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		if (this.add_mesh) {
			this.upperarm_r.add(this.upperarm_r_mesh);
		}
		this.body.add(this.upperarm_r);
		// right lowerarm
		this.lowerarm_r = new THREE.Group();

		this.lowerarm_r_mesh = this.getLimbMesh(
			this.elbow_radius,
			this.wrist_size,
			this.smallarm_size
		);

		if (this.add_mesh) {
			this.lowerarm_r.add(this.lowerarm_r_mesh);
		}
		this.body.add(this.lowerarm_r);

		// left thigh
		this.thigh_l = new THREE.Group();

		this.thigh_l_mesh = this.getLimbMesh(
			this.thigh_radius,
			this.knee_radius,
			this.thigh_size
		);

		if (this.add_mesh) {
			this.thigh_l.add(this.thigh_l_mesh);
		}
		this.body.add(this.thigh_l);
		// right thigh
		this.thigh_r = new THREE.Group();

		this.thigh_r_mesh = this.getLimbMesh(
			this.thigh_radius,
			this.knee_radius,
			this.thigh_size
		);

		if (this.add_mesh) {
			this.thigh_r.add(this.thigh_r_mesh);
		}
		this.body.add(this.thigh_r);
		// left calf
		this.calf_l = new THREE.Group();

		this.calf_l_mesh = this.getLimbMesh(
			this.knee_radius,
			this.ankle_radius,
			this.calf_size
		);

		if (this.add_mesh) {
			this.calf_l.add(this.calf_l_mesh);
		}
		this.body.add(this.calf_l);
		// right calf
		this.calf_r = new THREE.Group();

		this.calf_r_mesh = this.getLimbMesh(
			this.knee_radius,
			this.ankle_radius,
			this.calf_size
		);

		if (this.add_mesh) {
			this.calf_r.add(this.calf_r_mesh);
		}
		this.body.add(this.calf_r);

		return this.body;
	}

	torsoRotation(left_shoulder2, right_shoulder2, left_hip2) {
		/**
		 * I have 2 vectors, U1 and V1 (from origin) in 3D space, together forming a plane P1.
		 * The vectors then both changes to U2 and V2 (still from origin) forming a new plane P2.
		 * Is there there a way to obtain the quaternion representing the rotation between P1 and P2?
		 *
		 * From u1 and v1, the normal vector n1 of P1 can be obtained.
		 * From u2 and v2, the normal vector n2 of P2 can be obtained.
		 * The rotation between P1 and P2 actually is the rotation between n1 and n2.
		 * Given two vectors n1 and n2, we can find a rotation matrix R such that n2=Rn1.
		 * Then convert the rotation matrix to a quaternion.
		 *
		 */

		// const left_shoulder1 = new THREE.Vector3(1, 0, 0);
		// const right_shoulder1 = new THREE.Vector3(0, 0, 0);
		// const left_hip1 = new THREE.Vector3(0, -1, 0);

		// const shoulder1 = new THREE.Vector3().subVectors(
		// 	left_shoulder1,
		// 	right_shoulder1
		// );
		// const oblique1 = new THREE.Vector3().subVectors(
		// 	left_shoulder1,
		// 	left_hip1
		// );

		// const n1 = new THREE.Vector3().crossVectors(shoulder1, oblique1);

		const xaxis0 = new THREE.Vector3(1, 0, 0);
		const yaxis0 = new THREE.Vector3(0, -1, 0);
		const zaxis0 = new THREE.Vector3(0, 0, 1);

		const m0 = new THREE.Matrix4().makeBasis(xaxis0, yaxis0, zaxis0);

		const xaxis = new THREE.Vector3()
			.subVectors(left_shoulder2, right_shoulder2)
			.normalize();

		const oblique2 = new THREE.Vector3()
			.subVectors(left_shoulder2, left_hip2)
			.normalize();

		const zaxis = new THREE.Vector3()
			.crossVectors(xaxis, oblique2)
			.normalize();

		const yaxis = new THREE.Vector3()
			.crossVectors(xaxis, zaxis)
			.normalize();

		console.log("pos", left_shoulder2, right_shoulder2, left_hip2);
		console.log(xaxis, yaxis, zaxis);

		const m1 = new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

		m0.invert();

		const m = m1.multiply(m0);

		const q2 = new THREE.Quaternion().setFromRotationMatrix(m);

		return q2;
	}

	applyPose(pose3D, resize = false) {
		/**
		 * apply pose to mesh, adjust it's position and scale
		 */
		if (!pose3D || !pose3D.length) {
			return;
		}

		// get position of joints
		const nose = pose3D[BlazePoseKeypointsValues["NOSE"]];

		const shoulder_pose_l =
			pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]];
		const elbow_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_ELBOW"]];
		const wrist_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_WRIST"]];
		const hip_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_HIP"]];
		const knee_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_KNEE"]];
		const ankle_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_ANKLE"]];

		const shoulder_pose_r =
			pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]];
		const elbow_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]];
		const wrist_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_WRIST"]];
		const hip_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]];
		const knee_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_KNEE"]];
		const ankle_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_ANKLE"]];

		const torso_q = this.torsoRotation(
			new THREE.Vector3(
				shoulder_pose_l.x,
				shoulder_pose_l.y,
				shoulder_pose_l.z
			),
			new THREE.Vector3(
				shoulder_pose_r.x,
				shoulder_pose_r.y,
				shoulder_pose_r.z
			),
			new THREE.Vector3(hip_pose_l.x, hip_pose_l.y, hip_pose_l.z)
		);

		this.torso_mesh.rotation.setFromQuaternion(torso_q);

		return;

		// set limbs positions
		// this.head.position.set(nose.x, nose.y, nose.z);

		this.upperarm_l.position.set(
			shoulder_pose_l.x,
			shoulder_pose_l.y,
			shoulder_pose_l.z
		);
		this.lowerarm_l.position.set(
			elbow_pose_l.x,
			elbow_pose_l.y,
			elbow_pose_l.z
		);
		this.thigh_l.position.set(hip_pose_l.x, hip_pose_l.y, hip_pose_l.z);
		this.calf_l.position.set(knee_pose_l.x, knee_pose_l.y, knee_pose_l.z);

		this.upperarm_r.position.set(
			shoulder_pose_r.x,
			shoulder_pose_r.y,
			shoulder_pose_r.z
		);
		this.lowerarm_r.position.set(
			elbow_pose_r.x,
			elbow_pose_r.y,
			elbow_pose_r.z
		);
		this.thigh_r.position.set(hip_pose_r.x, hip_pose_r.y, hip_pose_r.z);
		this.calf_r.position.set(knee_pose_r.x, knee_pose_r.y, knee_pose_r.z);

		// calculate the target vectors for limbs
		const upperarm_l_target = posePointsToVector(
			elbow_pose_l,
			shoulder_pose_l
		);
		const lowerarm_l_target = posePointsToVector(
			wrist_pose_l,
			elbow_pose_l
		);
		const thigh_l_target = posePointsToVector(knee_pose_l, hip_pose_l);
		const calf_l_target = posePointsToVector(ankle_pose_l, knee_pose_l);

		const upperarm_r_target = posePointsToVector(
			elbow_pose_r,
			shoulder_pose_r
		);
		const lowerarm_r_target = posePointsToVector(
			wrist_pose_r,
			elbow_pose_r
		);
		const thigh_r_target = posePointsToVector(knee_pose_r, hip_pose_r);
		const calf_r_target = posePointsToVector(ankle_pose_r, knee_pose_r);

		// calculate quaternions for limbs
		const upperarm_l_q = quaternionFromVectors(
			this.init_vector,
			upperarm_l_target
		);
		const lowerarm_l_q = quaternionFromVectors(
			this.init_vector,
			lowerarm_l_target
		);
		const thigh_l_q = quaternionFromVectors(
			this.init_vector,
			thigh_l_target
		);
		const calf_l_q = quaternionFromVectors(this.init_vector, calf_l_target);

		const upperarm_r_q = quaternionFromVectors(
			this.init_vector,
			upperarm_r_target
		);
		const lowerarm_r_q = quaternionFromVectors(
			this.init_vector,
			lowerarm_r_target
		);
		const thigh_r_q = quaternionFromVectors(
			this.init_vector,
			thigh_r_target
		);
		const calf_r_q = quaternionFromVectors(this.init_vector, calf_r_target);

		this.upperarm_l.setRotationFromQuaternion(upperarm_l_q);
		this.lowerarm_l.setRotationFromQuaternion(lowerarm_l_q);
		this.thigh_l.setRotationFromQuaternion(thigh_l_q);
		this.calf_l.setRotationFromQuaternion(calf_l_q);

		this.upperarm_r.setRotationFromQuaternion(upperarm_r_q);
		this.lowerarm_r.setRotationFromQuaternion(lowerarm_r_q);
		this.thigh_r.setRotationFromQuaternion(thigh_r_q);
		this.calf_r.setRotationFromQuaternion(calf_r_q);
	}

	applyColor(colors) {
		/**
		 * apply color to mesh
		 */

		for (let name in colors) {
			// if (name === "lowerarm_r") {
			// 	console.log(colors[name], this[name + "_mesh"]);
			// }

			this[name + "_mesh"].material.color.setRGB(
				Number(colors[name][0]) / 255,
				Number(colors[name][1]) / 255,
				Number(colors[name][2]) / 255
			);
		}
	}

	// meshToLine(mesh) {
	// 	const sampler = new MeshSurfaceSampler(mesh).build();

	// 	const tempPosition = new THREE.Vector3();

	// 	const points = []

	// 	for (let i = 0; i < 500; i++) {
	// 		sampler.sample(tempPosition);
	// 		points.push(tempPosition.clone())
	// 	}

	// 	// const curve = new THREE.CatmullRomCurve3(points).getPoints(100);

	// 	const geometry = new THREE.BufferGeometry().setFromPoints( points );

	// 	// const material = new MeshLineMaterial( {
	// 	// 	transparent: true,
	// 	// 	depthTest:false,
	// 	// 	lineWidth:0.5,
	// 	// 	color: 0xffcc12,
	// 	// 	dashArray:4,
	// 	// 	dashRatio:0.95,
	// 	// } );

	// 	const material = new THREE.PointsMaterial({
	// 		color: 0x47b2f5,
	// 		size: 0.1,
	// 		// transparent: true,
	// 		// opacity: 0.5,
	// 	});

	// 	return new THREE.Points( geometry, material );
	// }
}
