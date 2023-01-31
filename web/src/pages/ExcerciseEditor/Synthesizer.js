import { cloneDeep } from "lodash";
import { useEffect, useState, useRef } from "react";

export default function Synthesizer({
	training,
	settraining,
	selectedExercise,
	setselectedExercise,
}) {
	const [totalRound, settotalRound] = useState(0);
	const [totalWidth, settotalWidth] = useState(0);

	const [showEditor, setshowEditor] = useState(false);
	const [editorLeft, seteditorLeft] = useState(0);

	const muscleColors = {
		chest: "rgba(255, 0, 0)",
		back: "rgb(255, 234, 2)",
		arms: "rgb(48, 255, 2)",
		abdominals: "rgb(228, 106, 18)",
		legs: "rgb(2, 36, 255)",
		shoulders: "rgb(2, 255, 251)",
	};

	useEffect(() => {
		settotalWidth(document.documentElement.clientWidth);

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (training && training.length) {
			let t = 0;

			for (let v of training) {
				t += parseInt(v.round);
			}

			settotalRound(t);
		}
	}, [training]);

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
				muscleColors[animation_data.muscle_groups[i]] +
				" " +
				(Number(i) / animation_data.muscle_groups.length) * 100 +
				"%";
			gradient +=
				", " +
				muscleColors[animation_data.muscle_groups[i]] +
				" " +
				((Number(i) + 1) / animation_data.muscle_groups.length) * 100 +
				"%";
		}

		gradient += ")";

		return gradient;
	}

	return (
		<div className={"training-bar"}>
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
								background: getBackgroundColor(item.animation),
							}}
							onClick={(e) => {
								if (i === selectedExercise) {
									setshowEditor(!showEditor);
								} else {
									setshowEditor(true);

									const { left, width } =
										e.target.getBoundingClientRect();

									seteditorLeft(left + width / 2 - 100);
								}

								setselectedExercise(i);
							}}
						></div>
					);
				})}
			{showEditor && (
				<div className="editor" style={{ left: editorLeft + "px" }}>
					<div className="num">
						{training &&
							training.map((item, i) => {
								if (Number(i) === Number(selectedExercise)) {
									return <span>{item.round}</span>;
								}
							})}
					</div>
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

								setshowEditor(false);
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

								setshowEditor(false);
							}

							settraining(tmp);
						}}
					>
						x
					</div>
				</div>
			)}
		</div>
	);
}
