import { useEffect, useState } from "react";

import "../styles/css/TrainingReport.css";
import MusclePercentage from "../components/MusclePercentage";

export default function TrainingReport() {
	const [report, setreport] = useState(null);

	useEffect(() => {
		let res = window.localStorage.getItem("statistics");

		try {
			res = JSON.parse(res);

			for (let e of res.exercises) {
				e.deviation = [];

				for (let name in e.error_angles) {
					e.deviation.push([
						name,
						(e.error_angles[name] /= e.total_compared_frame),
					]);
				}
			}

			console.log(res);

			setreport(res);
		} catch (e) {
			console.info(e);
		}
	}, []);

	return (
		<div className="main-content training-report">
			{report && (
				<section>
					<div className="title">
						<h1>Training Report</h1>
					</div>
					<div className="basic-info grenze">
						<div>
							<h3>{report.name}</h3>
						</div>
						<div>
							<span>Total time:</span>
							<span>{report.duration}</span>
						</div>
						<div>
							<span>Total calories:</span>
							<span>{report.calories}</span>
						</div>
						{/* <div>
							<span>Total followed time:</span>
							<span>{report.followed}</span>
						</div>
						<div>
							<span>Total followed percentage:</span>
							<span>
								{(report.followed / report.duration) * 100}%
							</span>
						</div>
						<div className="explain">
							<i>
								if "Total followed percentage" is less than 80%,
								suggest user to use a lower Difficult score
							</i>
						</div> */}
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
											For weekly/monthly exercise, suggest
											user exercise every muscle group
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
									<div
										key={i}
										className="exercise-info grenze"
									>
										<div className="name">
											<span>name: {exercise.name}</span>
										</div>
										<div>
											<span>Reps: {exercise.reps}</span>
										</div>
										<div>
											<span>
												Time spent:
												{
													~~(
														(exercise.end_time -
															exercise.start_time) /
														1000
													)
												}
												s
											</span>
										</div>
										<div>
											<span>Muscles exercised:</span>
											<span>
												<MusclePercentage
													musclesPercent={
														exercise.muscles
													}
												/>
											</span>
										</div>
										<div>
											<span>
												Unfollowed duration:
												{exercise.unfollowed}
											</span>
										</div>
										<div className="explain">
											<i>
												if "unffolowed" percentage is
												too high, suggest longer rest
												time before exercise
											</i>
										</div>
										<div>
											<span>Deviation: </span>
											{exercise.deviation &&
												exercise.deviation.map(
													(item, idx) => {
														return (
															<div key={idx}>
																<span>
																	{item[0]}:
																</span>
																<span>
																	{item[1]}
																</span>
															</div>
														);
													}
												)}
										</div>

										<div className="explain">
											<i>
												if "Deviation" is too high,
												suggest a less difficult
												exercise
											</i>
										</div>
									</div>
								);
							})}
					</div>
				</section>
			)}
		</div>
	);
}
