import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { BodyGeometry } from "../models/BodyGeometry";
import { InteractionManager } from "three.interactive";
import { getEdgeVerticesIndexMapping } from "../components/ropes";

let uppderarm = null;
let forearm = null;

export default function Playground3D() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const interactionManager = useRef(null);
	const addedDots = useRef({});

	const startAngle = useRef([0, 0]);
	const moveAngle = useRef([0, 0]);

	const showDotsHelper = useRef(false);

	const body = new BodyGeometry();

	const [forearmTopIdx, setforearmTopIdx] = useState([]);
	const [upperarmBottomIdx, setupperarmBottomIdx] = useState([]);
	const [armsMapping, setarmsMapping] = useState({});

	useEffect(() => {
		_scene();

		_camera();

		_light();

		const unit_size = 1;

		const uppderarm_vex = body.uppderarm(unit_size);
		const forearm_vex = body.forearm(unit_size);

		uppderarm = body.bufferGeo(body.skincolor1, uppderarm_vex);
		forearm = body.bufferGeo(body.skincolor1, forearm_vex);

		const [idx1, idx2, mapping] = getEdgeVerticesIndexMapping(
			"y",
			uppderarm,
			body.eb_y2,
			forearm,
			body.fa_y0
		);

		setupperarmBottomIdx(idx1);
		setforearmTopIdx(idx2);
		setarmsMapping(mapping);

		scene.current.add(uppderarm);
		scene.current.add(forearm);

		forearm.position.y = unit_size * body.eb_y2;

		// uppderarm.rotation.z = -0.2;

		const axesHelper = new THREE.AxesHelper(3);
		scene.current.add(axesHelper);

		_render();

		interactionManager.current = new InteractionManager(
			renderer.current,
			camera.current,
			renderer.current.domElement
		);

		// dotsHelper(deltoid_vex, upparmGroup);
		// dotsHelper(bicep_vex, upparmGroup);
		// dotsHelper(elbow_vex, elbowGroup);
		dotsHelper(uppderarm_vex, uppderarm);
		dotsHelper(forearm_vex, forearm);

		interactionManager.current.update();

		renderer.current.render(scene.current, camera.current);

		/**************************************/
		const positionAttribute = forearm.geometry.getAttribute("position");
		const vertex = new THREE.Vector3();
		vertex.fromBufferAttribute(positionAttribute, 6);

		forearm.updateMatrixWorld();

		forearm.localToWorld(vertex);

		// console.log(vertex);
		/**************************************/

		containerRef.current.addEventListener("mousedown", rotateStart);

		const containerCurrent = containerRef.current;

		return () => {
			renderer.current.dispose();
			if (containerCurrent) {
				containerCurrent.removeEventListener("mousedown", rotateStart);
			}
			// eslint-disable-next-line
		};
		// eslint-disable-next-line
	}, []);

	function updateVertices() {
		forearm.rotation.z = 1;

		forearm.updateMatrixWorld();

		const positionForearm = forearm.geometry.getAttribute("position");

		const indexedPositonForearm = {};

		for (let i of forearmTopIdx) {
			const vertex = new THREE.Vector3();

			vertex.fromBufferAttribute(positionForearm, i);

			forearm.localToWorld(vertex);

			uppderarm.worldToLocal(vertex);

			indexedPositonForearm[i] = vertex;
		}

		console.log(indexedPositonForearm);

		const positionUpperarmArray =
			uppderarm.geometry.getAttribute("position").array;

		console.log(positionUpperarmArray);

		for (let j of upperarmBottomIdx) {
			const targetVertex = indexedPositonForearm[armsMapping[j]];

			// console.log(target)

			positionUpperarmArray[j * 3] = targetVertex.x;
			positionUpperarmArray[j * 3 + 1] = targetVertex.y;
			positionUpperarmArray[j * 3 + 2] = targetVertex.z;
		}

		// const positionAttribute = forearm.geometry.getAttribute("position");

		// for (let i = 0; i < positionAttribute.count; i++) {
		// 	// get world position of positions
		// 	const vertex = new THREE.Vector3();
		// 	vertex.fromBufferAttribute(positionAttribute, i);

		// 	forearm.localToWorld(vertex);

		// 	console.log(vertex);
		// 	// console.log("x", positions[i]);
		// 	// console.log("y", positions[i + 1]);
		// 	// console.log("z", positions[i + 2]);
		// 	uppderarm.worldToLocal(vertex);

		// 	// create a mapping from upperarm bottom to forearm top

		// 	console.log(vertex);
		// }

		uppderarm.geometry.attributes.position.needsUpdate = true; // required after the first render

		uppderarm.geometry.computeBoundingBox();
		uppderarm.geometry.computeBoundingSphere();

		forearm.geometry.attributes.position.needsUpdate = true; // required after the first render

		forearm.geometry.computeBoundingBox();
		forearm.geometry.computeBoundingSphere();

		renderer.current.render(scene.current, camera.current);
	}

	function dotsHelper(vertices, group) {
		if (!showDotsHelper.current) {
			return;
		}

		for (const vertex of vertices) {
			if (addedDots.current[JSON.stringify(vertex.pos)]) {
				continue;
			}

			addedDots.current[JSON.stringify(vertex.pos)] = true;

			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				"position",
				new THREE.Float32BufferAttribute(vertex.pos, 3)
			);

			const material = new THREE.PointsMaterial({
				size: 0.2,
				color: 0xff0000,
			});

			const point = new THREE.Points(geometry, material);

			point.userData.position = vertex.pos;

			point.addEventListener("click", (event) => {
				event.stopPropagation();
				console.log(event.target.userData.position, event);
			});

			group.add(point);

			interactionManager.current.add(point);
		}

		// points.userData.position =
	}

	// function onClickObject() {
	// 	const raycaster = new THREE.Raycaster();
	// 	const mouse = new THREE.Vector2();
	// 	raycaster.setFromCamera(mouse, camera.current);

	// 	const intersects = raycaster.intersectObjects(
	// 		scene.current.children,
	// 		true
	// 	); //array

	// 	if (intersects.length > 0) {
	// 		const selectedObject = intersects[0];
	// 		console.log(selectedObject.object.userData.position);
	// 	}
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

		camera.current.position.y = -10;
		camera.current.position.x = 0;
		camera.current.position.z = 15;
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

		interactionManager.current.update();

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
						updateVertices();
					}}
				>
					action1
				</button>
			</div>
		</div>
	);
}
