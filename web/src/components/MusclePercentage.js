import "../styles/css/MusclePercentage.css";

export default function MusclePercentage({ musclesPercent, limit = 10 }) {
	const muscleArr = [
		"chest",
		"shoulders",
		"back",
		"arms",
		"abdominals",
		"legs",
	];

	return (
		<div className="muscle-percentage">
			{muscleArr.map((name, idx) => {
				return (
					<i key={idx}>
						{Boolean(
							idx < Number(limit) && name in musclesPercent
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
