import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { cloneDeep } from "lodash";

import "../styles/css/TrainingBuilder.css";
import TrainingSlideEditor from "../components/TrainingSlideEditor";
import MusclePercentage from "../components/MusclePercentage";

export default function TrainingBuilder() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const [scenePos, setscenePos] = useState({ top: -1000, left: -1000 });

	const kasten = useRef(null);

	const [itemWidth, setitemWidth] = useState(0);
	const [itemHeight, setitemHeight] = useState(0);

	const pageSize = 12;

	const [totalPage] = useState([1, 2, 3]);
	const [currentPage, setcurrentPage] = useState(1);
	const [allData, setallData] = useState([]);
	const [pageData, setpageData] = useState([]);

	const [trainingData, settrainingData] = useState({});

	useEffect(() => {
		let resizeObserver;
		// watch box size change and set size for individual block
		if (kasten.current) {
			// wait for the elementRef to be available
			resizeObserver = new ResizeObserver(([ResizeObserverEntry]) => {
				// Do what you want to do when the size of the element changes
				const width = parseInt(
					ResizeObserverEntry.contentRect.width / 4
				);

				setitemWidth(width);
				setitemHeight(width + 300);
			});
			resizeObserver.observe(kasten.current);
		}

		fetch(
			process.env.PUBLIC_URL +
				"/data/exercise-list.json?r=" +
				process.env.RANDOM_STRING
		)
			.then((response) => response.json())
			.then((data) => {
				const tmp = [[]];

				for (let e of data) {
					if (tmp[tmp.length - 1].length >= pageSize) {
						tmp.push([]);
					}

					tmp[tmp.length - 1].push(e);
				}

				setallData(tmp);
			});

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect(); // clean up observer
			}
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (!pageData || pageData.length === 0) {
			loadPageData(1);
		}

		// eslint-disable-next-line
	}, [allData]);

	function loadPageData(p) {
		setcurrentPage(p);

		const idx = Number(p) - 1;

		if (allData[idx]) {
			setpageData(allData[idx]);
		} else {
			setpageData([]);
		}
	}

	function addExerciseToTraining(exercise) {
		const tmp = cloneDeep(trainingData);

		if (!tmp || !tmp.exercises) {
			Object.assign(tmp, {
				name: "training name",
				duration: 1800,
				intensity: 10,
				calories: 1000,
				muscles: {
					chest: 0.6,
					shoulders: 0.3,
					back: 0.1,
					arms: 0.0,
					abdominals: 0.0,
					legs: 0.0,
				},
				exercises: [],
			});
		}

		tmp.exercises.push(Object.assign({ reps: 0, rest: 10 }, exercise));

		settrainingData(tmp);
	}

	function creatMainScene(viewWidth, viewHeight) {
		/**
		 * main scene, which plays exercise animation
		 * @param {number} viewWidth
		 * @param {number} viewHeight
		 */
		scene.current = new THREE.Scene();
		// scene.current.background = new THREE.Color(0x022244);

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 2);

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.4);
			dlight.position.set(0, 10, 10);
			scene.current.add(dlight);
			// env light
			scene.current.add(new THREE.AmbientLight(0xffffff, 0.6));
		}

		// drawScene();

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});

		renderer.current.toneMappingExposure = 0.5;

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		controls.current.enablePan = false;
		// controls.current.minPolarAngle = THREE.MathUtils.degToRad(60);
		// controls.current.maxPolarAngle = THREE.MathUtils.degToRad(90);
		controls.current.minDistance = 2;
		controls.current.maxDistance = 1000;
		controls.current.enableDamping = true;

		renderer.current.setSize(viewWidth, viewHeight);
	}

	return (
		<>
			<div className="main-content training-builder" ref={kasten}>
				<div className="title">
					<h1>Training Builder</h1>
				</div>
				<div>
					<TrainingSlideEditor
						trainingData={trainingData}
						settrainingData={settrainingData}
					/>
				</div>
				<div className="filters">
					<div>
						<span>Filter placeholder</span>
					</div>
				</div>
				<div className="exercise-list">
					{pageData.map((exercise, idx) => {
						return (
							<div
								key={idx}
								className="exercise-block"
								style={{
									width: itemWidth + "px",
									height: itemHeight + "px",
								}}
							>
								<div
									onClick={(e) => {
										const { top, left } =
											e.target.getBoundingClientRect();

										setscenePos({ top: top, left: left });
									}}
								>
									<img
										style={{
											width: itemWidth - 20 + "px",
											height: itemWidth - 20 + "px",
										}}
										src={
											exercise.img
												? process.env.PUBLIC_URL +
												  "/" +
												  exercise.img
												: process.env.PUBLIC_URL +
												  "/thumb1.png"
										}
										alt=""
									/>
								</div>
								<div>
									<span>{exercise.name}</span>
								</div>
								<div>
									<p>intensity: {exercise.intensity}</p>
									<p>calories: {exercise.calories}</p>
								</div>
								<div>
									<MusclePercentage
										musclesPercent={exercise.muscles}
									/>
								</div>
								<div>
									<div>
										<Button
											variant="primary"
											onClick={() => {
												addExerciseToTraining(exercise);
											}}
										>
											Add
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
				<div className="pagination">
					{totalPage.map((p) => {
						return (
							<div
								key={p}
								className={[
									"page",
									currentPage === p ? "active" : "",
								].join(" ")}
								onClick={() => {
									loadPageData(p);
								}}
							>
								<span>{p}</span>
							</div>
						);
					})}
				</div>
			</div>
			<canvas
				ref={canvasRef}
				style={{
					position: "absolute",
					top: scenePos.top + "px",
					left: scenePos.left + "px",
					width: itemWidth - 20 + "px",
					height: itemWidth - 20 + "px",
				}}
			/>
		</>
	);
}
