import { useEffect, useState, useRef } from "react";
import { cloneDeep } from "lodash";

import { muscleGroupsColors } from "../../components/ropes";

export default function Synthesizer({
	training,
	settraining,
	selectedExercise,
	setselectedExercise,
	height,
}) {
	const container = useRef(null);

	const [totalRound, settotalRound] = useState(0);
	const [totalWidth, settotalWidth] = useState(0);

	const [selectedExerciseRound, setselectedExerciseRound] = useState(0);
	const [selectedExerciseName, setselectedExerciseName] = useState("");

	useEffect(() => {
		if (container.current) {
			settotalWidth(container.current.clientWidth);
		}

		// eslint-disable-next-line
	}, [container.current]);

	useEffect(() => {
		if (training && training.length) {
			let t = 0;

			for (let i in training) {
				t += parseInt(training[i].round);

				if (Number(i) === Number(selectedExercise)) {
					setselectedExerciseRound(parseInt(training[i].round));

					setselectedExerciseName(training[i].animation.name);
				}
			}
			// console.log(training);
			settotalRound(t);
		}

		// eslint-disable-next-line
	}, [training]);

	useEffect(() => {
		if (selectedExercise > 0 && training[selectedExercise]) {
			setselectedExerciseRound(training[selectedExercise].round);
		}
	}, [selectedExercise]);

	function getBackgroundColor(animation_data) {
		if (
			!animation_data ||
			!animation_data.muscle_groups ||
			!animation_data.muscle_groups.length
		) {
			return "#cccccc";
		}

		let gradient = "linear-gradient(180deg";

		for (const i in animation_data.muscle_groups) {
			gradient +=
				", " +
				muscleGroupsColors[animation_data.muscle_groups[i]] +
				" " +
				(Number(i) / animation_data.muscle_groups.length) * 100 +
				"%";
			gradient +=
				", " +
				muscleGroupsColors[animation_data.muscle_groups[i]] +
				" " +
				((Number(i) + 1) / animation_data.muscle_groups.length) * 100 +
				"%";
		}

		gradient += ")";

		return gradient;
	}

	return (
		<div style={{ width: "100%", height: height + "px" }}>
			<div ref={container} className={"synthesizer"}>
				{training &&
					training.map((item, i) => {
						return (
							<div
								key={i}
								className={"exercise-block"}
								style={{
									width:
										(Number(item.round) / totalRound) *
											totalWidth +
										"px",
									height: "100%",
									background: getBackgroundColor(
										item.animation
									),
								}}
								onClick={(e) => {
									setselectedExercise(i);
								}}
							></div>
						);
					})}
			</div>

			<div className="actions">
				<div>{selectedExerciseName}</div>
				<div className="num">{selectedExerciseRound}</div>
				<div
					className="btn"
					onClick={() => {
						const tmp = cloneDeep(training);

						for (let i in tmp) {
							if (Number(i) === Number(selectedExercise)) {
								tmp[i].round += 1;
							}
						}

						settraining(tmp);
					}}
				>
					+
				</div>
				<div
					className="btn"
					onClick={() => {
						const tmp = cloneDeep(training);

						let toDelete = false;

						for (let i in tmp) {
							if (Number(i) === Number(selectedExercise)) {
								tmp[i].round -= 1;

								if (tmp[i].round <= 0) {
									toDelete = i;
								}
							}
						}

						if (toDelete !== false) {
							tmp.splice(toDelete, 1);
						}

						settraining(tmp);
					}}
				>
					-
				</div>
				<div
					className="btn"
					onClick={() => {
						const tmp = cloneDeep(training);

						let toDelete = false;

						for (let i in tmp) {
							if (Number(i) === Number(selectedExercise)) {
								toDelete = i;
							}
						}

						if (toDelete !== false) {
							tmp.splice(toDelete, 1);
						}

						settraining(tmp);
					}}
				>
					x
				</div>
				<div
					className="btn"
					onClick={() => {
						if (training && training.length) {
							const data = [];

							for (let v of training) {
								data.push({
									round: v.round,
									name: v.animation.name,
								});
							}

							sessionStorage.setItem("my-training", data);
						}
					}}
				>
					Save
				</div>
			</div>
		</div>
	);
}
