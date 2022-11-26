import { useEffect, useRef } from "react";

import * as THREE from "three";
import { MatchManFigure } from "../models/MatchManFigure";
import { POSE_LANDMARKS } from "@mediapipe/pose";
import {
	posePositionToVector,
	quaternionFromPositions,
} from "../components/ropes";
import { pose0 } from "../components/mypose";

export default function Playground3D() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	const startAngle = useRef([0, 0]);
	const moveAngle = useRef([0, 0]);

	const positionBeforeRotation = useRef([]);
	const positionAfterRotation = useRef([]);

	const oplane = useRef(null);

	const cbox = useRef(null);
	const armbox = useRef(null);
	const forearmbox = useRef(null);
	const handbox = useRef(null);

	useEffect(() => {
		_scene();

		_camera();

		_light();

		const axesHelper = new THREE.AxesHelper(3);
		scene.current.add(axesHelper);

		_render();

		renderer.current.render(scene.current, camera.current);

		containerRef.current.addEventListener("mousedown", rotateStart);

		const containerCurrent = containerRef.current;

		// scene1();
		// scene2();
		// scene3();

		scene4();

		return () => {
			renderer.current.dispose();
			if (containerCurrent) {
				containerCurrent.removeEventListener("mousedown", rotateStart);
			}
		};
		// eslint-disable-next-line
	}, []);

	function scene4() {
		camera.current.position.y = 1;

		cbox.current = colorfulBox();
		armbox.current = colorfulBox(0.5, 2, 0.5);
		forearmbox.current = colorfulBox(0.3, 2.2, 0.3);
		handbox.current = colorfulBox(0.3, 0.3, 0.3);

		armbox.current.position.x = 1;
		armbox.current.position.y = 1.5;
		armbox.current.position.z = 0;

		forearmbox.current.position.x = 0;
		forearmbox.current.position.y = 0.8;
		forearmbox.current.position.z = 0;

		handbox.current.position.y = 1.3;

		armbox.current.add(forearmbox.current);

		forearmbox.current.add(handbox.current);

		cbox.current.add(armbox.current);

		scene.current.add(cbox.current);

		renderer.current.render(scene.current, camera.current);
	}

	function action2() {
		//--------- rotate spine start
		/**
		 * this function find the proper quaternion for the spine
		 *
		 * the source of the pose is from mediapose data, using positions of LEFT_HIP,RIGHT_HIP,LEFT_SHOULDER
		 * these 3 points form a coords basis
		 *
		 * assume the initial basis of a human figure is -1, 0, 0,for right hip, 0,0,0 for left hip, 0.2,1,0 for left shoulder
		 * these 3 points also form a coords basis
		 *
		 * loggically, `vt1` should be RIGHT_HIP -> LEFT_HIP, for later investigation
		 */
		const v01 = new THREE.Vector3(-1, 0, 0);
		const v02 = new THREE.Vector3(0.2, 1, 0).normalize();
		const cross01 = new THREE.Vector3().crossVectors(v01, v02).normalize();
		const cross02 = new THREE.Vector3()
			.crossVectors(cross01, v01)
			.normalize();

		const vt1 = posePositionToVector(
			pose0[POSE_LANDMARKS["LEFT_HIP"]],
			pose0[POSE_LANDMARKS["RIGHT_HIP"]]
		).normalize();
		const vt2 = posePositionToVector(
			pose0[POSE_LANDMARKS["RIGHT_SHOULDER"]],
			pose0[POSE_LANDMARKS["RIGHT_HIP"]]
		).normalize();

		// console.log('vt1m', vt1m, 'vt2m', vt2m)

		// const vt1 = new THREE.Vector3(0, 0, -1);
		// const vt2 = new THREE.Vector3(1, 0, 0.2).normalize();

		const cross11 = new THREE.Vector3().crossVectors(vt1, vt2).normalize();
		const cross12 = new THREE.Vector3()
			.crossVectors(cross11, vt1)
			.normalize();

		// console.log("basis0", v01, cross01, cross02);
		// console.log("basis1", vt1, cross11, cross12);

		const q_spine = quaternionFromPositions(
			v01,
			cross01,
			cross02,
			vt1,
			cross11,
			cross12
		);

		cbox.current.applyQuaternion(q_spine);

		// ------------ rotate spine end

		// ------------ rotate arm start

		/**
		 * this transfer is from the target frame to the initial frame
		 * because in the arm's local transform, it is same as initial frame
		 *
		 * A_origin * A_target^{-1}
		 *
		 * after apply this rotation to the observed arm vector, it's back to the origin coords frame
		 * therefore we can calculate the arm rotation from the initial (0,1,0) vector
		 */
		//  const world_frame = new THREE.Matrix4().makeBasis(
		// 	v01,
		// 	cross01,
		// 	cross02
		// );

		// const spine_frame = new THREE.Matrix4().makeBasis(
		// 	vt1,
		// 	cross11,
		// 	cross12
		// );
		// const q_world_spine = new THREE.Quaternion().setFromRotationMatrix(
		// 	world_frame.multiply(spine_frame.invert())
		// );

		const vec_arm_world = posePositionToVector(
			pose0[POSE_LANDMARKS["RIGHT_ELBOW"]],
			pose0[POSE_LANDMARKS["RIGHT_SHOULDER"]]
		).normalize();

		const q_arm_world_spine = new THREE.Quaternion()
			.setFromEuler(cbox.current.rotation)
			.conjugate();

		const vec_arm_spine = vec_arm_world
			.clone()
			.applyQuaternion(q_arm_world_spine);

		const vec_arm_spine_origin = new THREE.Vector3(0, 1, 0);

		const q_arm_spine = new THREE.Quaternion().setFromUnitVectors(
			vec_arm_spine_origin,
			vec_arm_spine
		);

		armbox.current.applyQuaternion(q_arm_spine);
		// ------------ rotate arm end

		// ------------ rotate forarm start

		const vec_forearm_world = new THREE.Vector3(
			pose0[POSE_LANDMARKS["RIGHT_WRIST"]],
			pose0[POSE_LANDMARKS["RIGHT_ELBOW"]]
		).normalize();

		const q_arm_world = new THREE.Quaternion();

		armbox.current.getWorldQuaternion(q_arm_world);

		const forearm_vec_arm_origin = new THREE.Vector3(0, 1, 0);

		const forearm_vec_arm = vec_forearm_world
			.clone()
			.applyQuaternion(q_arm_world.conjugate());

		const q_forearm_arm = new THREE.Quaternion().setFromUnitVectors(
			forearm_vec_arm_origin,
			forearm_vec_arm
		);

		forearmbox.current.applyQuaternion(q_forearm_arm);

		// ------------ rotate forarm end

		renderer.current.render(scene.current, camera.current);
	}

	function scene3() {
		function drawline(a, b) {
			const va = new THREE.Vector3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

			const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
			const geometry = new THREE.BufferGeometry().setFromPoints([
				va,
				new THREE.Vector3(0, 0, 0),
			]);

			geometry.setDrawRange(0, 2);

			const line = new THREE.Line(geometry, material);

			line.position.x = b[0];
			line.position.y = b[1];
			line.position.z = b[2];

			return line;
		}

		const figure = new MatchManFigure(scene.current, [0, 0, 0]);

		figure.init();

		figure.pose_array(pose0);

		// negate all points, that's what we did in the match man
		for (let i in pose0) {
			pose0[i][0] *= -figure.unit;
			pose0[i][1] *= -figure.unit;
			pose0[i][2] *= -figure.unit;
		}

		// pointing to the screen, negative z
		const shoulderVector = posePositionToVector(
			pose0[POSE_LANDMARKS["LEFT_SHOULDER"]],
			pose0[POSE_LANDMARKS["RIGHT_SHOULDER"]]
		).normalize();
		// pointing up, negative y
		const armVector = posePositionToVector(
			pose0[POSE_LANDMARKS["RIGHT_ELBOW"]],
			pose0[POSE_LANDMARKS["RIGHT_SHOULDER"]]
		).normalize();

		console.log("shoulderVector", shoulderVector, "armVector", armVector);

		const q = new THREE.Quaternion().setFromUnitVectors(
			shoulderVector,
			armVector
		);

		// console.log(q);

		const e = new THREE.Euler().setFromQuaternion(q);

		console.log(e);

		const sline = drawline(
			pose0[POSE_LANDMARKS["LEFT_SHOULDER"]],
			pose0[POSE_LANDMARKS["RIGHT_SHOULDER"]]
		);
		const aline = drawline(
			pose0[POSE_LANDMARKS["RIGHT_ELBOW"]],
			pose0[POSE_LANDMARKS["RIGHT_SHOULDER"]]
		);

		sline.setRotationFromEuler(e);
		// sline.setRotationFromQuaternion(q);

		// sline.rotation.x = 0.3;

		scene.current.add(sline);
		scene.current.add(aline);

		renderer.current.render(scene.current, camera.current);
	}

	function scene1() {
		const m1 = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			opacity: 0.1,
			transparent: true,
		});
		const g1 = new THREE.PlaneGeometry(8, 16);
		const p1 = new THREE.Mesh(g1, m1);

		const m2 = new THREE.MeshBasicMaterial({ color: 0xffd700 });
		const g2 = new THREE.PlaneGeometry(1, 16);
		const p2 = new THREE.Mesh(g2, m2);

		p2.position.x = -3;

		const m3 = new THREE.MeshBasicMaterial({ color: 0x800080 });
		const g3 = new THREE.PlaneGeometry(7, 1);
		const p3 = new THREE.Mesh(g3, m3);

		p3.position.y = -8;

		const m4 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		const g4 = new THREE.PlaneGeometry(1, 1);
		const d4 = new THREE.Mesh(g4, m4);

		d4.position.x = 3;
		d4.position.y = -8;

		const m5 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const g5 = new THREE.PlaneGeometry(1, 1);
		const d5 = new THREE.Mesh(g5, m5);

		d5.position.x = -3;
		d5.position.y = -8;

		const m6 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
		const g6 = new THREE.PlaneGeometry(1, 1);
		const d6 = new THREE.Mesh(g6, m6);

		d6.position.x = -3;
		d6.position.y = 8;

		p1.add(p2);
		p1.add(p3);
		p1.add(d4);
		p1.add(d5);
		p1.add(d6);

		oplane.current = p1;

		scene.current.add(p1);

		renderer.current.render(scene.current, camera.current);

		const d4v = new THREE.Vector3();
		const d5v = new THREE.Vector3();
		const d6v = new THREE.Vector3();

		d4.getWorldPosition(d4v);
		d5.getWorldPosition(d5v);
		d6.getWorldPosition(d6v);

		positionBeforeRotation.current.push(d4v);
		positionBeforeRotation.current.push(d5v);
		positionBeforeRotation.current.push(d6v);

		renderer.current.render(scene.current, camera.current);
	}

	function scene2() {
		const m1 = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			opacity: 0.1,
			transparent: true,
		});
		const g1 = new THREE.PlaneGeometry(8, 16);
		const p1 = new THREE.Mesh(g1, m1);

		const m2 = new THREE.MeshBasicMaterial({ color: 0xffd700 });
		const g2 = new THREE.PlaneGeometry(1, 16);
		const p2 = new THREE.Mesh(g2, m2);

		p2.position.x = -3;

		const m3 = new THREE.MeshBasicMaterial({ color: 0x800080 });
		const g3 = new THREE.PlaneGeometry(7, 1);
		const p3 = new THREE.Mesh(g3, m3);

		p3.position.y = -8;

		const m4 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		const g4 = new THREE.PlaneGeometry(1, 1);
		const d4 = new THREE.Mesh(g4, m4);

		d4.position.x = 3;
		d4.position.y = -8;

		const m5 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		const g5 = new THREE.PlaneGeometry(1, 1);
		const d5 = new THREE.Mesh(g5, m5);

		d5.position.x = -3;
		d5.position.y = -8;

		const m6 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
		const g6 = new THREE.PlaneGeometry(1, 1);
		const d6 = new THREE.Mesh(g6, m6);

		d6.position.x = -3;
		d6.position.y = 8;

		p1.add(p2);
		p1.add(p3);
		p1.add(d4);
		p1.add(d5);
		p1.add(d6);

		p1.rotation.x = -Math.PI / 2;
		p1.rotation.z = Math.PI / 4.5;

		scene.current.add(p1);

		renderer.current.render(scene.current, camera.current);

		const d4v = new THREE.Vector3();
		const d5v = new THREE.Vector3();
		const d6v = new THREE.Vector3();

		d4.getWorldPosition(d4v);
		d5.getWorldPosition(d5v);
		d6.getWorldPosition(d6v);

		// console.log('d4', d4v);
		// console.log('d5', d5v);
		// console.log('d6', d6v);

		positionAfterRotation.current.push(d4v);
		positionAfterRotation.current.push(d5v);
		positionAfterRotation.current.push(d6v);
	}

	function colorfulBox(width = 2, height = 3, depth = 1) {
		const boxgeo = new THREE.BoxGeometry(width, height, depth);

		const positionAttribute = boxgeo.getAttribute("position");
		const colors = [];

		const color = new THREE.Color();

		for (let i = 0; i < positionAttribute.count; i += 6) {
			color.setHex((0xffffff * (i + 1)) / (positionAttribute.count + 5));

			colors.push(color.r, color.g, color.b);
			colors.push(color.r, color.g, color.b);
			colors.push(color.r, color.g, color.b);

			colors.push(color.r, color.g, color.b);
			colors.push(color.r, color.g, color.b);
			colors.push(color.r, color.g, color.b);
		} // for

		// define the new attribute
		boxgeo.setAttribute(
			"color",
			new THREE.Float32BufferAttribute(colors, 3)
		);

		const material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			vertexColors: true,
		});
		return new THREE.Mesh(boxgeo, material);
	}

	function _scene() {
		const backgroundColor = 0x000000;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);
		scene.current.fog = new THREE.Fog(backgroundColor, 60, 100);
	}

	function _camera() {
		const viewWidth = document.documentElement.clientWidth;
		const viewHeight = document.documentElement.clientHeight;
		/**
		 * The first attribute is the field of view.
		 * FOV is the extent of the scene that is seen on the display at any given moment.
		 * The value is in degrees.
		 *
		 * The second one is the aspect ratio.
		 * You almost always want to use the width of the element divided by the height,
		 * or you'll get the same result as when you play old movies on a widescreen TV
		 * - the image looks squished.
		 *
		 * The next two attributes are the near and far clipping plane.
		 * What that means, is that objects further away from the camera
		 * than the value of far or closer than near won't be rendered.
		 * You don't have to worry about this now,
		 * but you may want to use other values in your apps to get better performance.
		 */
		camera.current = new THREE.PerspectiveCamera(
			75,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.y = 0;
		camera.current.position.x = 0;
		camera.current.position.z = 5;
	}

	function _light() {
		const color = 0xffffff;
		const amblight = new THREE.AmbientLight(color, 0.8);
		scene.current.add(amblight);

		const plight = new THREE.PointLight(color, 1);
		plight.position.set(5, 5, 2);
		scene.current.add(plight);
	}

	function _render() {
		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		const viewWidth = document.documentElement.clientWidth;
		const viewHeight = document.documentElement.clientHeight;

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function relativePos(eventObj) {
		// the radius of the sphere
		// used to calculate the angle
		// the smaller, the faster the angle changes
		const radius = 100;

		const box = containerRef.current.getBoundingClientRect();

		const x = eventObj.pageX - box.width / 2;
		const y = eventObj.pageY - box.width / 2;

		return [
			Math.atan(x / radius) - startAngle.current[0],
			Math.atan(y / radius) - startAngle.current[1],
		];
	}

	//跟随鼠标3d转动部分需要用到的函数--------------------------------------------------------开始
	// 旋转开始阶段，计算出鼠标点击时刻的坐标，并由此计算出点击时的空间三维向量，初始化时间和角度，在目标元素上移除事件，在document上绑定事件
	function rotateStart(e) {
		//非常重要，如果没有这一句，会出现鼠标点击抬起无效
		e.preventDefault();
		startAngle.current = relativePos(e);
		// 获得当前已旋转的角度
		// oldAngle = angle;

		// oldTime = new Date().getTime();
		// // 绑定三个事件
		containerRef.current.removeEventListener("mousedown", rotateStart);
		containerRef.current.addEventListener("mousemove", rotate);
		containerRef.current.addEventListener("mouseup", rotateFinish);
	}

	// 旋转函数，计算鼠标经过位置的向量，计算旋转轴，旋转的角度，请求动画，更新每一帧的时间
	function rotate(e) {
		//非常重要，如果没有这一句，会出现鼠标点击抬起无效
		e.preventDefault();
		// 计算鼠标经过轨迹的空间坐标
		moveAngle.current = relativePos(e);

		// figure.current.group.rotation.x = moveAngle.current[1];
		scene.current.rotation.y = moveAngle.current[0];
		scene.current.rotation.x = moveAngle.current[1];

		renderer.current.render(scene.current, camera.current);
	}

	/**
	 * [rotateFinish 旋转结束，移除document上的两个绑定事件mousemove & mouseup，重新给目标元素绑定事件mousedown，计算初始矩阵，取消动画]
	 * @return {[type]}   [description]
	 */
	function rotateFinish() {
		startAngle.current = moveAngle.current;

		containerRef.current.removeEventListener("mousemove", rotate);
		containerRef.current.removeEventListener("mouseup", rotateFinish);
		containerRef.current.addEventListener("mousedown", rotateStart);
	}

	return (
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>

			<div className="btn-box">
				<button
					onClick={() => {
						quaternionFromPositions(
							...positionBeforeRotation.current,
							...positionAfterRotation.current
						);
					}}
				>
					action1
				</button>
				<button
					onClick={() => {
						action2();
					}}
				>
					action2
				</button>
			</div>
		</div>
	);
}
