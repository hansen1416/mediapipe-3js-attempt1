import "../styles/css/MusclePercentage.css";
import { muscleGroupsColors } from "../components/ropes";

export default function MusclePercentage({ musclesPercent, limit = 10 }) {
	const muscleArr = Object.keys(muscleGroupsColors);

	return (
		<div className="muscle-percentage">
			{muscleArr.map((name, idx) => {
				return (
					<i key={idx}>
						{Boolean(
							idx < Number(limit) &&
								name in musclesPercent &&
								~~musclesPercent[name]
						) && (
							<span>
								{name}: {musclesPercent[name]}%
							</span>
						)}
					</i>
				);
			})}
		</div>
	);
}
