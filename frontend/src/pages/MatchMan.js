import { useEffect, useRef } from "react";

import * as THREE from "three";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

import { MatchManFigure } from "../models/MatchManFigure";
import { tmppose } from "../components/mypose";
import { getUserMedia } from "../components/ropes";

export default function MatchMan() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const figure = useRef(null);
	const figure2 = useRef(null);

	// the radius of the sphere
	// used to calculate the angle
	// the smaller, the faster the angle changes
	const radius = 100;

	const startAngle = useRef([0, 0]);
	const moveAngle = useRef([0, 0]);

	const posedata = useRef([]);
	const poseidx = useRef(0);
	const animationFramePointer = useRef(0);
	const animationStep = useRef(0);

	const posedata2 = useRef([]);
	const poseidx2 = useRef(0);
	const animationFramePointer2 = useRef(0);
	const animationStep2 = useRef(0);

	const speed = useRef(3);

	const videoRef = useRef(null);
	// const animationCounter = useRef(1);
	const mediacamera = useRef(null);

	useEffect(() => {
		const backgroundColor = 0x000000;

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

		// const axesHelper = new THREE.AxesHelper(5);
		// scene.current.add(axesHelper);

		figure.current = new MatchManFigure(scene.current, [-3, -1, 0]);

		figure.current.init();

		figure.current.pose_dict(tmppose);

		figure2.current = new MatchManFigure(scene.current, [3, -1, 0]);

		figure2.current.init();

		figure2.current.pose_dict(tmppose);

		camera.current.position.y = 0;
		camera.current.position.x = 0;
		camera.current.position.z = 5;

		// camera.current.rotation.x = 0.1;

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		renderer.current.setSize(viewWidth, viewHeight);

		renderer.current.render(scene.current, camera.current);

		containerRef.current.addEventListener("mousedown", rotateStart);

		// containerRef.current.addEventListener("click", get3dpos);

		return () => {
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

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
		scene.current.rotation.y = moveAngle.current[0];

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

	// function onFrame(video, ctx) {
	// 	ctx.drawImage(video, 0, 0);
	// }

	function fetchPose(action_name) {
		fetch(
			process.env.REACT_APP_API_URL +
				"/pose/data?" +
				new URLSearchParams({
					action_name: action_name,
				}),
			{
				method: "GET", // *GET, POST, PUT, DELETE, etc.
				// mode: 'cors', // no-cors, *cors, same-origin
				// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				// credentials: 'same-origin', // include, *same-origin, omit
				// headers: {
				// 	"Content-Type": "multipart/form-data",
				// },
				// redirect: 'follow', // manual, *follow, error
				// referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
				// body: formData, // body data type must match "Content-Type" header
			}
		)
			.then((response) => response.json())
			.then((data) => {
				console.log(data.data[0]);

				poseidx.current = 0;

				animationStep.current = 0;

				posedata.current = data.data;

				playPose();
			})
			.catch(function (error) {
				console.log(
					error.message,
					error.response,
					error.request,
					error.config
				);
			});
	}

	function playPose() {
		if (animationStep.current % speed.current === 0) {
			figure.current.pose_array(posedata.current[poseidx.current]);

			renderer.current.render(scene.current, camera.current);

			poseidx.current += 1;
		}

		animationStep.current += 1;

		if (true || poseidx.current >= posedata.current.length) {
			poseidx.current = 0;
			animationStep.current = 0;

			// animationFramePointer.current = requestAnimationFrame(playPose);
			cancelAnimationFrame(animationFramePointer.current);
		} else {
			animationFramePointer.current = requestAnimationFrame(playPose);
		}
	}

	function fetchPose2(action_name) {
		fetch(
			process.env.REACT_APP_API_URL +
				"/pose/data2?" +
				new URLSearchParams({
					action_name: action_name,
				}),
			{
				method: "GET", // *GET, POST, PUT, DELETE, etc.
				// mode: 'cors', // no-cors, *cors, same-origin
				// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				// credentials: 'same-origin', // include, *same-origin, omit
				// headers: {
				// 	"Content-Type": "multipart/form-data",
				// },
				// redirect: 'follow', // manual, *follow, error
				// referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
				// body: formData, // body data type must match "Content-Type" header
			}
		)
			.then((response) => response.json())
			.then((data) => {
				console.log(data);

				poseidx2.current = 0;

				animationStep2.current = 0;

				posedata2.current = data.data;

				playPose2();
			})
			.catch(function (error) {
				console.log(
					error.message,
					error.response,
					error.request,
					error.config
				);
			});
	}

	function playPose2() {
		if (animationStep2.current % speed.current === 0) {
			figure2.current.pose_array(posedata2.current[poseidx2.current]);

			renderer.current.render(scene.current, camera.current);

			poseidx2.current += 1;
		}

		animationStep2.current += 1;

		if (poseidx2.current >= posedata2.current.length) {
			poseidx2.current = 0;
			animationStep2.current = 0;

			// animationFramePointer.current = requestAnimationFrame(playPose);
			cancelAnimationFrame(animationFramePointer2.current);
		} else {
			animationFramePointer2.current = requestAnimationFrame(playPose2);
		}
	}

	function startCamera() {
		if (videoRef.current) {
			getUserMedia(
				{ video: true },
				(stream) => {
					// Yay, now our webcam input is treated as a normal video and
					// we can start having fun
					try {
						videoRef.current.srcObject = stream;

						// let stream_settings = stream
						// 	.getVideoTracks()[0]
						// 	.getSettings();

						// console.log(stream_settings);
					} catch (error) {
						videoRef.current.src = URL.createObjectURL(stream);
					}
					// Let's start drawing the canvas!
				},
				(err) => {
					throw err;
				}
			);

			const pose = new Pose({
				locateFile: (file) => {
					return process.env.PUBLIC_URL + `/mediapipe/${file}`;
					// return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
				},
			});
			pose.setOptions({
				modelComplexity: 2,
				smoothLandmarks: false,
				enableSegmentation: false,
				smoothSegmentation: false,
				minDetectionConfidence: 0.5,
				minTrackingConfidence: 0.5,
			});
			pose.onResults(onPoseResults);

			pose.initialize().then(() => {
				console.info("Loaded pose model");
			});

			// const ctx = canvasRef.current.getContext("2d");

			mediacamera.current = new Camera(videoRef.current, {
				onFrame: async () => {
					// onFrame(videoRef.current, ctx);

					// if (animationCounter.current % 4 === 0) {
					await pose.send({ image: videoRef.current });

					// animationCounter.current = 0;
					// }

					// animationCounter.current += 1;
				},
				width: 640,
				height: 360,
			});

			mediacamera.current.start();
		}
	}

	function onPoseResults(results) {
		const wlm = results.poseWorldLandmarks;

		if (!wlm) {
			return;
		}

		// console.log(wlm);
		// tmp_pose(wlm);

		figure.current.pose_dict(wlm);

		renderer.current.render(scene.current, camera.current);
	}

	return (
		<div className="scene" ref={containerRef}>
			<video ref={videoRef} autoPlay={true}></video>

			<canvas ref={canvasRef}></canvas>

			<div className="btn-box">
				<button
					onClick={() => {
						fetchPose("800-900");
						fetchPose2("800-900");
					}}
				>
					action1
				</button>{" "}
				<button
					onClick={() => {
						fetchPose("1500-1600");
						fetchPose2("1500-1600");
					}}
				>
					action2
				</button>
				<button
					onClick={() => {
						fetchPose("2300-2400");
						fetchPose2("2300-2400");
					}}
				>
					action3
				</button>
				<button onClick={startCamera}>camera sync</button>
			</div>
		</div>
	);
}
