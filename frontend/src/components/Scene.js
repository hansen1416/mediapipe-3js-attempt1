import { useEffect, useRef } from "react";
import "./Home.css";

import * as THREE from "three";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { Figure } from "./figure";

export default function Scene() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const figure = useRef(null);

	// the radius of the sphere
	// used to calculate the angle
	// the smaller, the faster the angle changes
	const radius = 100;

	const startAngle = useRef([0, 0]);
	const moveAngle = useRef([0, 0]);

	useEffect(() => {
		const backgroundColor = 0x363795;

		const viewWidth = document.documentElement.clientWidth;
		const viewHeight = document.documentElement.clientHeight;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);
		scene.current.fog = new THREE.Fog(backgroundColor, 60, 100);

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

		const axesHelper = new THREE.AxesHelper(5);
		scene.current.add(axesHelper);

		figure.current = new Figure(scene.current, [0, -0.5, -0.2]);

		figure.current.init();

		figure.current.bigArmRotate([-0.5, 0, 0], -1);
		figure.current.bigArmRotate([0.5, 0, 0], 1);

		figure.current.smallArmRotate([-0.3, 0, 0], -1);
		figure.current.smallArmRotate([-0.3, 0, 0], 1);

		figure.current.thighRotate([0.5, 0, 0], -1);
		figure.current.thighRotate([-0.5, 0, 0], 1);

		figure.current.crusRotate([0.3, 0, 0], -1);
		figure.current.crusRotate([0.3, 0, 0], 1);

		camera.current.position.z = 5;
		camera.current.position.y = 0.4;

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		renderer.current.setSize(viewWidth, viewHeight);

		renderer.current.render(scene.current, camera.current);

		containerRef.current.addEventListener("mousedown", rotateStart);

		containerRef.current.addEventListener("click", get3dpos);

		return () => {
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	function get3dpos(event) {
		var vec = new THREE.Vector3(); // create once and reuse
		var pos = new THREE.Vector3(); // create once and reuse

		vec.set(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
			0.5
		);

		vec.unproject(camera.current);

		vec.sub(camera.current.position).normalize();

		var distance = -camera.current.position.z / vec.z;

		pos.copy(camera.current.position).add(vec.multiplyScalar(distance));

		console.info(pos);
	}

	function relativePos(eventObj) {
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
		figure.current.group.rotation.y = moveAngle.current[0];

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
		<div ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}
