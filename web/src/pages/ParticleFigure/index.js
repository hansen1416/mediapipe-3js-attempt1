import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Button from "react-bootstrap/Button";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { cloneDeep } from "lodash";

import SubThreeJsScene from "../../components/SubThreeJsScene";
import Silhouette3D from "../../components/Silhouette3D";
import {
	BlazePoseKeypoints,
	BlazePoseConfig,
	drawPoseKeypoints,
	loadJSON,
	loadFBX,
	startCamera,
} from "../../components/ropes";

/**
 * https://nimb.ws/YdEVQT
 * @returns
 */

function traverseModel(model, bodyParts) {
	if (model && model.isMesh) {
		// console.log(model.name, model.children.length)
		bodyParts[model.name] = model;
	}
	// console.log(model, model.name, model.matrix);

	model.children.forEach((child) => {
		traverseModel(child, bodyParts);
	});
}

export default function ParticleFigure() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const figure = useRef([]);
	// const fbxmodel = useRef(null);

	// ========= captured pose logic
	const [capturedPose, setcapturedPose] = useState();
	const counter = useRef(0);
	// ========= captured pose logic

	// ========= pose json data
	const capturedPoseRef = useRef(0);
	const storedPose = useRef([]);
	const [playPose, setPlayPose] = useState(false);
	const playPoseRef = useRef(false);
	// ========= pose json data

	const poseDetector = useRef(null);

	const videoRef = useRef(null);
	// NOTE: we must give a width/height ratio not close to 1, otherwise there will be wired behaviors
	const [subsceneWidth, setsubsceneWidth] = useState(334);
	const [subsceneHeight, setsubsceneHeight] = useState(250);

	const [startBtnShow, setstartBtnShow] = useState(true);
	const [stopBtnShow, setstopBtnShow] = useState(false);

	const meshes = useRef({});

	function jsonToBufferGeometry(data) {
		const geometry = new THREE.BufferGeometry();

		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(
				new Float32Array(data.data.attributes.position.array),
				3
			)
		);
		geometry.setAttribute(
			"normal",
			new THREE.BufferAttribute(
				new Float32Array(data.data.attributes.normal.array),
				3
			)
		);
		geometry.setAttribute(
			"uv",
			new THREE.BufferAttribute(new Float32Array(data.data.attributes.uv.array), 2)
		);

		return geometry
	}

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		setsubsceneWidth(documentWidth * 0.25);
		setsubsceneHeight((documentWidth * 0.25 * 480) / 640);

		_scene(documentWidth, documentHeight);

		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				BlazePoseConfig
			),
			loadJSON(
				process.env.PUBLIC_URL + "/posejson/wlm1500-1600.npy.json"
			),
			loadFBX(process.env.PUBLIC_URL + "/fbx/T_0.fbx"),
		]).then(([detector, pose3d, model]) => {
			poseDetector.current = detector;

			storedPose.current = pose3d;

			// scene.current.add(model);

			traverseModel(model, meshes.current);

			figure.current = new Silhouette3D({});
			const body = figure.current.init();

			scene.current.add(body);
		});


		const poss = {
			"abs": {
				"x": 0,
				"y": 73.06646537780762,
				"z": 2.173459053039551
			},
			"chest": {
				"x": 0,
				"y": 96.37579345703125,
				"z": 1.555971384048462
			},
			"neck": {
				"x": -2.384185791015625e-7,
				"y": 108.9151611328125,
				"z": 1.2082147598266602
			},
			"head": {
				"x": 0,
				"y": 115.1942367553711,
				"z": 2.442631244659424
			},
			"foot_l": {
				"x": 6.038201689720154,
				"y": 4.189789369702339,
				"z": 5.3377227783203125
			},
			"foot_r": {
				"x": -6.038201689720154,
				"y": 4.189789369702339,
				"z": 5.3377227783203125
			},
			"calf_l": {
				"x": 6.078888535499573,
				"y": 24.266510009765625,
				"z": 1.186724066734314
			},
			"calf_r": {
				"x": -6.078888535499573,
				"y": 24.266510009765625,
				"z": 1.186724066734314
			},
			"lowerarm_l": {
				"x": 34.57040786743164,
				"y": 98.3515853881836,
				"z": -0.5303339958190918
			},
			"lowerarm_r": {
				"x": -34.57040786743164,
				"y": 98.3515853881836,
				"z": -0.5303339958190918
			},
			"pelma_l": {
				"x": 5.950271844863892,
				"y": 2.106816291809082,
				"z": 9.454838275909424
			},
			"pelma_r": {
				"x": -5.950271844863892,
				"y": 2.106816291809082,
				"z": 9.454838275909424
			},
			"thigh_l": {
				"x": 6.465143918991089,
				"y": 52.77687644958496,
				"z": 1.2393369674682617
			},
			"thigh_r": {
				"x": -6.465143918991089,
				"y": 52.77687644958496,
				"z": 1.2393369674682617
			},
			"knee_l": {
				"x": 5.950271725654602,
				"y": 39.12459182739258,
				"z": 1.4469028115272522
			},
			"knee_r": {
				"x": -5.950271725654602,
				"y": 39.12459182739258,
				"z": 1.4469028115272522
			},
			"wrist_l": {
				"x": 42.58299446105957,
				"y": 97.59692001342773,
				"z": 0.7862309217453003
			},
			"wrist_r": {
				"x": -42.58299446105957,
				"y": 97.59692001342773,
				"z": 0.7862309217453003
			},
			"shoulder_l": {
				"x": 10.224750518798828,
				"y": 99.86847686767578,
				"z": 1.8163499236106873
			},
			"shoulder_r": {
				"x": -10.224750518798828,
				"y": 99.86847686767578,
				"z": 1.8163499236106873
			},
			"elbow_l": {
				"x": 26.771096229553223,
				"y": 98.29524612426758,
				"z": -0.9946861267089844
			},
			"elbow_r": {
				"x": -26.771096229553223,
				"y": 98.29524612426758,
				"z": -0.9946861267089844
			},
			"hand_l": {
				"x": 49.42721748352051,
				"y": 97.63338470458984,
				"z": 3.562742054462433
			},
			"hand_r": {
				"x": -49.42721748352051,
				"y": 97.63338470458984,
				"z": 3.562742054462433
			},
			"upperarm_l": {
				"x": 18.69175386428833,
				"y": 99.65556335449219,
				"z": 0.5235534906387329
			},
			"upperarm_r": {
				"x": -18.69175386428833,
				"y": 99.65556335449219,
				"z": 0.5235534906387329
			},
			"hip_l": {
				"x": 5.822864592075348,
				"y": 66.59577178955078,
				"z": 1.9783098697662354
			},
			"hip_r": {
				"x": -5.822864592075348,
				"y": 66.59577178955078,
				"z": 1.9783098697662354
			},
			"ankle_l": {
				"x": 5.950271844863892,
				"y": 8.869707345962524,
				"z": -4.76837158203125e-7
			},
			"ankle_r": {
				"x": -5.950271844863892,
				"y": 8.869707345962524,
				"z": -4.76837158203125e-7
			},
		}


		const tasks = []

		for (let name in poss) {
			tasks.push(loadJSON(
				process.env.PUBLIC_URL + "/t/" + name + ".json"
			))
		}

		Promise.all(tasks)
		.then((results) => {
			for (let data of results) {

				const name = data.name
				
				const mesh = new THREE.Mesh(
					jsonToBufferGeometry(data),
					new THREE.MeshLambertMaterial({
						color: 0x12c2e9,
						transparent: true,
						opacity: 0.6,
					})
				)

				mesh.position.set(poss[name].x, poss[name].y, poss[name].z)

				scene.current.add(mesh);
			}
		})

		// const axesHelper = new THREE.AxesHelper(40);

		// scene.current.add(axesHelper);

		animate();

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};
	}, []);

	useEffect(() => {
		playPoseRef.current = playPose;
	}, [playPose]);

	function animate() {
		// ========= captured pose logic
		if (
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			!playPoseRef.current &&
			counter.current % 6 === 0
		) {
			(async () => {
				const poses = await poseDetector.current.estimatePoses(
					videoRef.current
				);

				if (
					!poses ||
					!poses[0] ||
					!poses[0]["keypoints"] ||
					!poses[0]["keypoints3D"]
				) {
					return;
				}

				{
					const drawdata = cloneDeep(poses[0]["keypoints3D"]);

					const width_ratio = 30;
					const height_ratio = (width_ratio * 480) / 640;

					// multiply x,y by differnt factor
					for (let v of drawdata) {
						v["x"] *= width_ratio;
						v["y"] *= -height_ratio;
						v["z"] *= -width_ratio;
					}

					const g = drawPoseKeypoints(drawdata);

					g.scale.set(8, 8, 8);

					setcapturedPose(g);

					// for (let i in figures.current) {
					// 	figures.current[i].applyPose(drawdata, true);
					// }

					figure.current.applyPose(drawdata);
				}
			})();
		}

		if (
			counter.current % 3 === 0 &&
			storedPose.current &&
			storedPose.current.length &&
			playPoseRef.current
		) {
			const drawdata = [];

			for (let i in storedPose.current[capturedPoseRef.current]) {
				drawdata[i] = Object.assign(
					{ name: BlazePoseKeypoints[i].toLowerCase() },
					storedPose.current[capturedPoseRef.current][i]
				);
			}

			const width_ratio = 30;
			const height_ratio = (width_ratio * 480) / 640;

			// multiply x,y by differnt factor
			for (let v of drawdata) {
				v["x"] *= width_ratio;
				v["y"] *= -height_ratio;
				v["z"] *= -width_ratio;
			}

			const g = drawPoseKeypoints(drawdata);

			g.scale.set(8, 8, 8);

			setcapturedPose(g);

			figure.current.applyPose(drawdata, true);

			capturedPoseRef.current += 1;

			if (capturedPoseRef.current >= storedPose.current.length) {
				capturedPoseRef.current = 0;
			}
		}

		counter.current += 1;
		// ========= captured pose logic

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function _scene(viewWidth, viewHeight) {
		const backgroundColor = 0x022244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 150);

		{
			const light = new THREE.PointLight(0xffffff, 1);
			// light.position.set(10, 10, 10);
			camera.current.add(light);

			scene.current.add(camera.current);
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	return (
		<div className="digital-trainer">
			<video
				ref={videoRef}
				autoPlay={true}
				width={subsceneWidth + "px"}
				height={subsceneHeight + "px"}
				style={{
					display: "none",
				}}
				// style={{
				// 	display: "block",
				// 	position: "absolute",
				// 	top: 0,
				// 	left: subsceneWidth + "px",
				// }}
			></video>

			<canvas ref={canvasRef} />
			{/* // ========= captured pose logic */}
			<div
				style={{
					width: subsceneWidth + "px",
					height: subsceneHeight + "px",
					position: "absolute",
					top: 0,
					left: 0,
				}}
			>
				<SubThreeJsScene
					width={subsceneWidth}
					height={subsceneHeight}
					objects={capturedPose}
					cameraZ={200}
				/>
			</div>
			{/* // ========= captured pose logic */}
			<div className="controls">
				<div style={{ marginBottom: "40px" }}>
					{startBtnShow && (
						<Button
							variant="primary"
							onClick={() => {
								if (videoRef.current) {
									startCamera(videoRef.current);

									// count down loop hook. default 5 seconds

									setstartBtnShow(false);
									setstopBtnShow(true);
								}
							}}
						>
							Start
						</Button>
					)}
					{stopBtnShow && (
						<Button
							variant="secondary"
							onClick={() => {
								if (videoRef.current) {
									videoRef.current.srcObject = null;

									setstopBtnShow(false);
								}
							}}
						>
							Stop
						</Button>
					)}

					<Button
						variant="primary"
						onClick={() => {
							setPlayPose(!playPose);
						}}
						style={{
							marginLeft: 20,
						}}
					>
						PlayPose
					</Button>
				</div>
			</div>
		</div>
	);
}
