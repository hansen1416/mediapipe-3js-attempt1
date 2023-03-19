import { useEffect, useState } from "react";

import "../../styles/css/TrainingReport.css";
import MusclePercentage from "../../components/MusclePercentage";

export default function TrainingReport() {
	const [report, setreport] = useState({});

	useEffect(() => {
		setreport({
			duration: 100,
			difficulty: 100,
			followed: 85,
			muscles: {
				chest: 30,
				shoulders: 10,
				back: 10,
				arms: 20,
				abdominals: 10,
				legs: 20,
			},
			exercises: [
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
				{
					name: "crunch",
					reps: 10,
					error_rate: 0.8,
					duration: 45,
					unfollowed: 3,
				},
			],
		});
	}, []);

	return (
		<div className="main-content training-report">
			<div className="title">
				<h1>Training Report</h1>
			</div>
			<div className="basic-info grenze">
				<div>
					<span>Total time:</span>
					<span>{report.duration}</span>
				</div>
				<div>
					<span>Difficulty score:</span>
					<span>{report.difficulty}</span>
				</div>
				<div>
					<span>Total followed time:</span>
					<span>{report.followed}</span>
				</div>
				<div>
					<span>Total followed percentage:</span>
					<span>{(report.followed / report.duration) * 100}%</span>
				</div>
				<div className="explain">
					<i>
						if "Total followed percentage" is less than 80%, suggest
						user to use a lower Difficult score
					</i>
				</div>
				<div>
					<div>
						<span>Muscles exercised:</span>
					</div>
					{report.muscles && (
						<div>
							<div>
								<span>
									<MusclePercentage
										musclesPercent={report.muscles}
									/>
								</span>
							</div>
							<div className="explain">
								<i>
									For weekly/monthly exercise, suggest user
									exercise every muscle group
								</i>
							</div>
						</div>
					)}
				</div>
			</div>
			<div>
				{report &&
					report.exercises &&
					report.exercises.map((exercise, i) => {
						return (
							<div key={i} className="exercise-info grenze">
								<div className="name">
									<span>name: {exercise.name}</span>
								</div>
								<div>
									<span>Reps: {exercise.reps}</span>
									<span>
										Error rate: {exercise.error_rate}
									</span>
								</div>
								<div className="explain">
									<i>
										if "error rate" is too high, suggest a
										less difficult exercise
									</i>
								</div>
								<div>
									<span>Duration: {exercise.duration}</span>
									<span>
										Unfollowed duration:
										{exercise.unfollowed}
									</span>
								</div>
								<div className="explain">
									<i>
										if "unffolowed" percentage is too high,
										suggest longer rest time before exercise
									</i>
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
}
