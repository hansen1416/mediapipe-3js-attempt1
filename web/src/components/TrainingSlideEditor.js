import { useEffect, useRef, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import Button from "react-bootstrap/Button";
import { cloneDeep } from "lodash";

import "../styles/css/TrainingSlideEditor.css";
import MusclePercentage from "./MusclePercentage";
import InputIncreaseDecrease from "./InputIncreaseDecrease";
import { roundToTwo } from "./ropes";

export default function TrainingSlideEditor({ trainingData, settrainingData }) {
	const kasten = useRef(null);

	const [itemWidth, setitemWidth] = useState(0);

	useEffect(() => {
		let resizeObserver;
		// watch box size change and set size for individual block
		if (kasten.current) {
			// wait for the elementRef to be available
			resizeObserver = new ResizeObserver(([ResizeObserverEntry]) => {
				// Do what you want to do when the size of the element changes
				const width = parseInt(
					ResizeObserverEntry.contentRect.width / 6
				);

				setitemWidth(width);
			});
			resizeObserver.observe(kasten.current);
		}
	}, []);

	function updateExercise(idx, dict) {
		const tmp = cloneDeep(trainingData);

		for (let i in tmp.exercises) {
			if (Number(i) === Number(idx)) {
				Object.assign(tmp.exercises[i], dict);
			}
		}

		calculateTrainingInfo(tmp);

		settrainingData(tmp);
	}

	function calculateTrainingInfo(trainingData) {
		trainingData.duration = 0;
		trainingData.calories = 0;
		trainingData.intensity = 0;

		trainingData.muscle_groups.chest = 0;
		trainingData.muscle_groups.shoulders = 0;
		trainingData.muscle_groups.back = 0;
		trainingData.muscle_groups.arms = 0;
		trainingData.muscle_groups.abdominals = 0;
		trainingData.muscle_groups.legs = 0;

		for (let e of trainingData.exercises) {
			trainingData.duration +=
				Number(e.reps) * Number(e.duration) + Number(e.rest);
			trainingData.calories += Number(e.reps) * Number(e.calories);
			trainingData.intensity += Number(e.intensity);

			trainingData.muscle_groups.chest += Number(e.muscle_groups.chest);
			trainingData.muscle_groups.shoulders += Number(e.muscle_groups.shoulders);
			trainingData.muscle_groups.back += Number(e.muscle_groups.back);
			trainingData.muscle_groups.arms += Number(e.muscle_groups.arms);
			trainingData.muscle_groups.abdominals += Number(e.muscle_groups.abdominals);
			trainingData.muscle_groups.legs += Number(e.muscle_groups.legs);
		}

		if (trainingData.exercises.length) {
			trainingData.intensity /= trainingData.exercises.length;

			trainingData.muscle_groups.chest /= trainingData.exercises.length;
			trainingData.muscle_groups.shoulders /= trainingData.exercises.length;
			trainingData.muscle_groups.back /= trainingData.exercises.length;
			trainingData.muscle_groups.arms /= trainingData.exercises.length;
			trainingData.muscle_groups.abdominals /= trainingData.exercises.length;
			trainingData.muscle_groups.legs /= trainingData.exercises.length;
		}
	}

	return (
		<div className="training-slide-editor" ref={kasten}>
			{trainingData && trainingData.name && (
				<section>
					<div className="title">
						<div className="info">
							<div className="name">
								<span>
									name:{" "}
									<input
										value={trainingData.name}
										onChange={(e) => {
											const tmp = cloneDeep(trainingData);

											tmp.name = e.target.value;

											settrainingData(tmp);
										}}
									/>
								</span>
							</div>
							<div className="stats">
								<span>duration: {roundToTwo(trainingData.duration)}</span>
								<span>intensity: {roundToTwo(trainingData.intensity)}</span>
								<span>calories: {roundToTwo(trainingData.calories)}</span>
							</div>
							<div>
								<MusclePercentage
									musclesPercent={trainingData.muscle_groups}
								/>
							</div>
						</div>
						<div className="operation">
							<Button
								variant="primary"
								onClick={() => {
									// todo, save to user's
									console.log(trainingData);
								}}
							>
								Save to my list
							</Button>
						</div>
					</div>
					<Splide
						options={{
							type: "slide",
							focus: 0,
							perMove: 1,
							fixedWidth: itemWidth,
							// fixedHeight: 200,
							gap: 10,
							arrows: false,
							rewind: true,
							pagination: false,
						}}
					>
						{Boolean(trainingData && trainingData.exercises) &&
							trainingData.exercises.map((exercise, idx) => {
								return (
									<SplideSlide key={idx}>
										<div
											style={{
												width: itemWidth,
												height: "100%",
											}}
										>
											<div
												style={{
													width: itemWidth,
													height: itemWidth,
												}}
											>
												<img
													style={{
														width: "100%",
														height: "100%",
													}}
													src={
														process.env.PUBLIC_URL +
														"/thumb1.png"
													}
													alt=""
												/>
											</div>
											<div>
												<p>{exercise.name}</p>
												<MusclePercentage
													musclesPercent={
														exercise.muscle_groups
													}
													limit={3}
												/>
											</div>
											<div>
												<div className="num-control">
													<span>reps: </span>
													<span>
														<InputIncreaseDecrease
															value={
																exercise.reps
															}
															onChange={(v) => {
																updateExercise(
																	idx,
																	{ reps: v }
																);
															}}
														/>
													</span>
												</div>
												<div className="num-control">
													<span>rest: </span>
													<span>
														<InputIncreaseDecrease
															value={
																exercise.rest
															}
															onChange={(v) => {
																updateExercise(
																	idx,
																	{ rest: v }
																);
															}}
														/>
													</span>
												</div>
											</div>
										</div>
									</SplideSlide>
								);
							})}
					</Splide>
				</section>
			)}
		</div>
	);
}
