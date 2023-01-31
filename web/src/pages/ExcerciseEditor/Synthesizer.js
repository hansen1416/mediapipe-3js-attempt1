import { useEffect, useState, useRef } from "react";

export default function Synthesizer({ training, settraining, setselectedExercise }) {

	const [totalRound, settotalRound] = useState(0);
	const [totalWidth, settotalWidth] = useState(0);

	const [showEditor, setshowEditor] = useState(false);
	const [editorLeft, seteditorLeft] = useState(0);

	const muscleColors = {
		"chest": 'rgba(255, 0, 0)',
		"back": 'rgb(255, 234, 2)',
		"arms": 'rgb(48, 255, 2)',
		"abdominals": 'rgb(228, 106, 18)',
		"legs": 'rgb(2, 36, 255)',
		"shoulders": 'rgb(2, 255, 251)',
	}

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
		if (!animation_data || !animation_data.muscle_groups || !animation_data.muscle_groups.length) {
			return '#cccccc';
		}

		let gradient = 'linear-gradient(180deg'

		for (const i in animation_data.muscle_groups) {

			gradient += ", " + muscleColors[animation_data.muscle_groups[i]] + " " + Number(i)/animation_data.muscle_groups.length*100 + '%';
			gradient += ", " + muscleColors[animation_data.muscle_groups[i]] + " " + (Number(i)+1)/animation_data.muscle_groups.length*100 + '%';
		}

		gradient += ")";

		return gradient
	}

    return (
	<div
		className={'training-bar'}
	>
        {
			training && training.map((item, i) => {
				return (
				<div
					key={i}
					className={'exercise-block'}
					style={{
						width: (Number(item.round) / totalRound * totalWidth) + 'px', 
						height: '100%',
						background: getBackgroundColor(item.animation)
					}}
					onClick={(e) => {
						setselectedExercise(i);

						setshowEditor(!showEditor);

						const {left, width} = e.target.getBoundingClientRect();

						seteditorLeft(left + width/2 - 100);
					}}
				></div>)
			})
		}
		{
			showEditor && 
			<div 
				className="editor"
				style={{left: editorLeft + 'px'}}
			>
				<div className="btn">+</div>
				<div className="btn">-</div>
				<div className="btn">x</div>
			</div>
		}
    </div>)
}