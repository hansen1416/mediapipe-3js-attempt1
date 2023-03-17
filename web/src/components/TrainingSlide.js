import { useEffect, useRef, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import Button from "react-bootstrap/Button";
import "../styles/css/TrainingSlide.css";

import MusclePercentage from "./MusclePercentage";

export default function TrainingSlide({ trainingData }) {
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

	return (
		<div className="training-slide" ref={kasten}>
			<div className="title">
				<div>
					<span>name: {trainingData.name}</span>
					<span>duration: {trainingData.duration}</span>
					<span>intensity: {trainingData.intensity}</span>
					<span>calories: {trainingData.calories}</span>
					<MusclePercentage musclesPercent={trainingData.muscles} />
				</div>
				<div>
					<Button variant="primary" onClick={() => {}}>
						Try it now!
					</Button>
				</div>
			</div>
			<Splide
				options={{
					type: "slide",
					focus: 0,
					perMove: 1,
					fixedWidth: itemWidth,
					fixedHeight: itemWidth + 120,
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
										<p>intensity: {exercise.intensity}</p>
										<p>calories: {exercise.calories}</p>
										<MusclePercentage
											musclesPercent={exercise.muscles}
											limit={3}
										/>
									</div>
								</div>
							</SplideSlide>
						);
					})}

				{/* <div className="splide__arrows">
                <button className="splide__arrow splide__arrow--prev">Prev</button>
                <button className="splide__arrow splide__arrow--next">Next</button>
            </div> */}
			</Splide>
		</div>
	);
}
