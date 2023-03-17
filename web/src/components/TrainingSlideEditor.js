// import { useEffect, useRef, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import Button from "react-bootstrap/Button";
import { cloneDeep } from "lodash";

import "../styles/css/TrainingSlideEditor.css";
import MusclePercentage from "./MusclePercentage";
import InputIncreaseDecrease from "./InputIncreaseDecrease";

export default function TrainingSlideEditor({ trainingData, settrainingData }) {
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

		trainingData.muscles.chest = 0;
		trainingData.muscles.shoulders = 0;
		trainingData.muscles.back = 0;
		trainingData.muscles.arms = 0;
		trainingData.muscles.abdominals = 0;
		trainingData.muscles.legs = 0;

		for (let e of trainingData.exercises) {
			trainingData.duration +=
				Number(e.reps) * Number(e.duration) + Number(e.rest);
			trainingData.calories += Number(e.reps) * Number(e.calories);
			trainingData.intensity += Number(e.intensity);

			trainingData.muscles.chest += Number(e.muscles.chest);
			trainingData.muscles.shoulders += Number(e.muscles.shoulders);
			trainingData.muscles.back += Number(e.muscles.back);
			trainingData.muscles.arms += Number(e.muscles.arms);
			trainingData.muscles.abdominals += Number(e.muscles.abdominals);
			trainingData.muscles.legs += Number(e.muscles.legs);
		}

		if (trainingData.exercises.length) {
			trainingData.intensity /= trainingData.exercises.length;

			trainingData.muscles.chest /= trainingData.exercises.length;
			trainingData.muscles.shoulders /= trainingData.exercises.length;
			trainingData.muscles.back /= trainingData.exercises.length;
			trainingData.muscles.arms /= trainingData.exercises.length;
			trainingData.muscles.abdominals /= trainingData.exercises.length;
			trainingData.muscles.legs /= trainingData.exercises.length;
		}
	}

	return (
		<div className="training-slide-editor">
			{trainingData && trainingData.name && (
				<section>
					<div className="title">
						<div className="info">
							<div>
								<span>name: {trainingData.name}</span>
							</div>
							<div>
								<span>duration: {trainingData.duration}</span>
								<span>intensity: {trainingData.intensity}</span>
								<span>calories: {trainingData.calories}</span>
							</div>
							<div>
								<MusclePercentage
									musclesPercent={trainingData.muscles}
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
							fixedWidth: 160,
							// fixedHeight: 200,
							gap: 10,
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
												width: "100%",
												height: "100%",
											}}
										>
											<div
												style={{
													width: "100px",
													height: "100px",
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
														exercise.muscles
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
