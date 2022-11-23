import { useEffect, useRef } from "react";

import * as THREE from "three";
import { MatchManFigure } from "../models/MatchManFigure";
import { POSE_LANDMARKS } from "@mediapipe/pose";
import { posePositionToVector } from "../components/ropes";
import { Euler } from "three";

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

		scene3();

		return () => {
			renderer.current.dispose();
			if (containerCurrent) {
				containerCurrent.removeEventListener("mousedown", rotateStart);
			}
		};
		// eslint-disable-next-line
	}, []);

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

	function matrixFromPoints(a, b, c) {
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

		const axis3 = new THREE.Vector3()
			.crossVectors(axis1, axis2)
			.normalize();

		return new THREE.Matrix4().makeBasis(axis1, axis2, axis3);
	}

	function quaternionFromPositions(a1, b1, c1, a2, b2, c2) {
		const matrix1 = matrixFromPoints(a1, b1, c1);
		const matrix1i = matrix1.invert();

		const matrix2 = matrixFromPoints(a2, b2, c2);

		const B = matrix2.multiply(matrix1i);

		const Q = new THREE.Quaternion();

		Q.setFromRotationMatrix(B);

		const E = new THREE.Euler();

		// E.setFromQuaternion(Q);
		E.setFromRotationMatrix(B);

		console.log(E);

		// oplane.current.rotation.set(E.x, E.y, E.z)
		oplane.current.applyQuaternion(Q);

		renderer.current.render(scene.current, camera.current);
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
			</div>
		</div>
	);
}


const pose0=[
	[
		-0.422926664352417,
		-0.2454899698495865,
		-0.08404576033353806
	],
	[
		-0.4372890889644623,
		-0.26829513907432556,
		-0.08597814291715622
	],
	[
		-0.44169163703918457,
		-0.26922619342803955,
		-0.0753883421421051
	],
	[
		-0.4415387809276581,
		-0.26750215888023376,
		-0.07447941601276398
	],
	[
		-0.4472062289714813,
		-0.2715107500553131,
		-0.12883999943733215
	],
	[
		-0.44437190890312195,
		-0.2728702425956726,
		-0.14098531007766724
	],
	[
		-0.429772287607193,
		-0.27602407336235046,
		-0.1197526678442955
	],
	[
		-0.49715137481689453,
		-0.21296706795692444,
		-0.01785006746649742
	],
	[
		-0.4529144763946533,
		-0.17369212210178375,
		-0.1677437424659729
	],
	[
		-0.4370090365409851,
		-0.21483366191387177,
		-0.04892037436366081
	],
	[
		-0.41412675380706787,
		-0.20523272454738617,
		-0.11715158820152283
	],
	[
		-0.4426327645778656,
		-0.13217781484127045,
		0.08528824895620346
	],
	[
		-0.4924888014793396,
		-0.054376643151044846,
		-0.09159767627716064
	],
	[
		-0.4296969175338745,
		-0.3371916115283966,
		0.13946940004825592
	],
	[
		-0.33591675758361816,
		-0.2578006982803345,
		-0.1965467929840088
	],
	[
		-0.5671007037162781,
		-0.27740681171417236,
		0.2562633454799652
	],
	[
		-0.5661914944648743,
		-0.20261971652507782,
		-0.1677282750606537
	],
	[
		-0.6089069247245789,
		-0.2588896155357361,
		0.276468425989151
	],
	[
		-0.6360843181610107,
		-0.21063099801540375,
		-0.21332024037837982
	],
	[
		-0.6145117282867432,
		-0.21649891138076782,
		0.2844347655773163
	],
	[
		-0.6589618921279907,
		-0.19657352566719055,
		-0.20501607656478882
	],
	[
		-0.5609238147735596,
		-0.2645043730735779,
		0.2567789852619171
	],
	[
		-0.5879640579223633,
		-0.18410077691078186,
		-0.16499176621437073
	],
	[
		-0.004519591107964516,
		-0.03329932689666748,
		0.10094107687473297
	],
	[
		-0.0002444775018375367,
		0.029277265071868896,
		-0.09858701378107071
	],
	[
		0.2551214098930359,
		-0.31879210472106934,
		0.08803066611289978
	],
	[
		0.2288740575313568,
		-0.27649593353271484,
		-0.11021888256072998
	],
	[
		0.37234002351760864,
		-0.023143356665968895,
		0.22094738483428955
	],
	[
		0.3670012354850769,
		0.07860959321260452,
		0.02339256927371025
	],
	[
		0.3787204325199127,
		0.045023124665021896,
		0.24282822012901306
	],
	[
		0.3730102479457855,
		0.1328495442867279,
		0.006673609837889671
	],
	[
		0.4785938560962677,
		0.12136072665452957,
		0.2923670709133148
	],
	[
		0.45371899008750916,
		0.15646111965179443,
		0.03221692144870758
	]
];
