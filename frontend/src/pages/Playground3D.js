import { useEffect, useRef } from "react";

import * as THREE from "three";
import { MatchManFigure } from "../models/MatchManFigure";
import { POSE_LANDMARKS } from "@mediapipe/pose";
import { posePositionToVector, quaternionFromPositions } from "../components/ropes";
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

		const v01 = new THREE.Vector3(-1, 0, 0);
		const v02 = new THREE.Vector3(0.2, 1, 0).normalize();
		const cross0 = new THREE.Vector3().crossVectors(v02, v01);

		const vt1 = posePositionToVector(pose0[POSE_LANDMARKS["RIGHT_HIP"]], pose0[POSE_LANDMARKS["LEFT_HIP"]]).normalize();
		const vt2 = posePositionToVector(pose0[POSE_LANDMARKS["LEFT_SHOULDER"]], pose0[POSE_LANDMARKS["LEFT_HIP"]]).normalize();
		const cross1 = new THREE.Vector3().crossVectors(vt2, vt1);

		const q_spine = quaternionFromPositions(v01, v02, cross0, vt1, vt2, cross1);

		console.log(q_spine);

		const e_spine = new THREE.Euler().setFromQuaternion(q_spine);

		console.log(e_spine);

		renderer.current.render(scene.current, camera.current);
	}

	function scene3() {

		function drawline(a, b) {

			const va = new THREE.Vector3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

			const material = new THREE.LineBasicMaterial({color: 0xff0000});
			const geometry = new THREE.BufferGeometry().setFromPoints([va, new THREE.Vector3(0,0,0)]);

			geometry.setDrawRange(0, 2);

			const line = new THREE.Line(geometry, material);

			line.position.x = b[0];
			line.position.y = b[1];
			line.position.z = b[2];

			return line
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
		const shoulderVector = posePositionToVector(pose0[POSE_LANDMARKS['LEFT_SHOULDER']], pose0[POSE_LANDMARKS['RIGHT_SHOULDER']]).normalize();
		// pointing up, negative y
		const armVector = posePositionToVector(pose0[POSE_LANDMARKS['RIGHT_ELBOW']], pose0[POSE_LANDMARKS['RIGHT_SHOULDER']]).normalize();

		console.log('shoulderVector', shoulderVector, 'armVector', armVector);

		const q = new THREE.Quaternion().setFromUnitVectors(shoulderVector, armVector);

		// console.log(q);

		const e =  new THREE.Euler().setFromQuaternion(q);

		console.log(e);

		const sline = drawline(pose0[POSE_LANDMARKS['LEFT_SHOULDER']], pose0[POSE_LANDMARKS['RIGHT_SHOULDER']]);
		const aline = drawline(pose0[POSE_LANDMARKS['RIGHT_ELBOW']], pose0[POSE_LANDMARKS['RIGHT_SHOULDER']]);

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

	// function matrixFromPoints(a, b, c) {
	// 	const axis1 = new THREE.Vector3(
	// 		a.x - b.x,
	// 		a.y - b.y,
	// 		a.z - b.z
	// 	).normalize();
	// 	const axis2 = new THREE.Vector3(
	// 		c.x - b.x,
	// 		c.y - b.y,
	// 		c.z - b.z
	// 	).normalize();

	// 	const axis3 = new THREE.Vector3()
	// 		.crossVectors(axis1, axis2)
	// 		.normalize();

	// 	return new THREE.Matrix4().makeBasis(axis1, axis2, axis3);
	// }

	// function quaternionFromPositions(a1, b1, c1, a2, b2, c2) {
	// 	const matrix1 = matrixFromPoints(a1, b1, c1);
	// 	const matrix1i = matrix1.invert();

	// 	const matrix2 = matrixFromPoints(a2, b2, c2);

	// 	const B = matrix2.multiply(matrix1i);

	// 	const Q = new THREE.Quaternion();

	// 	Q.setFromRotationMatrix(B);

	// 	const E = new THREE.Euler();

	// 	// E.setFromQuaternion(Q);
	// 	E.setFromRotationMatrix(B);

	// 	console.log(E);

	// 	// oplane.current.rotation.set(E.x, E.y, E.z)
	// 	oplane.current.applyQuaternion(Q);

	// 	renderer.current.render(scene.current, camera.current);
	// }

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
			</div>
		</div>
	);
}

