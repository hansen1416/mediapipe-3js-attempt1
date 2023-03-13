import { useEffect, useRef, useState } from "react";
import TrainingSlide from "../../components/TrainingSlide";
import "../../styles/css/TrainingExplore.css";

export default function TrainingExplore() {
	const canvasRef = useRef(null);

	useEffect(() => {
		console.log(1123123123);
	}, []);

	return (
		<div className="main-content training-explore">
			<div className="title">
				<h1>Training Explore</h1>
			</div>
			<div>
				<div>
					<TrainingSlide />
				</div>
				<div>
					<canvas ref={canvasRef} />
				</div>
			</div>
		</div>
	);
}
