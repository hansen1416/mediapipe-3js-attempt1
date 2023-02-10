import { useEffect, useRef, useState } from "react";

export default function Slider({ value, setValue, maxValue, minValue, width, height }) {
	
	const knob = useRef(null);

	const [left, setleft] = useState(0);

	const startX = useRef(0)
	const valueRef = useRef(0)
	const initialValueRef = useRef(0)

	useEffect(() => {
		knob.current.addEventListener('mousedown', mousedownCallback)

		return () => {
			knob.current.removeEventListener('mousedown', mousedownCallback)
		}
	}, []);

	useEffect(() => {

		valueRef.current = value

		// setleft((value - minValue) / (maxValue - minValue) * 100);
		// setleft(value);
	}, [value]);

	function mousedownCallback(e) {

		knob.current.addEventListener('mousemove', mousemoveCallback)
		knob.current.addEventListener('mouseup', mouseupCallback)

		startX.current = e.pageX
		initialValueRef.current = valueRef.current

console.log('mousedownCallback', valueRef.current, initialValueRef.current)
	}

	function mousemoveCallback(e) {

console.log(e.pageX, e.pageX - startX.current, width)

		let diff = (e.pageX - startX.current) / width;

		if (diff > 1) {
			diff = 1
		} else if (diff < 0) {
			diff = 0
		}

		setValue(initialValueRef.current + diff)
	}

	function mouseupCallback() {
		knob.current.removeEventListener('mousemove', mousemoveCallback)
		knob.current.removeEventListener('mouseup', mouseupCallback)

		startX.current = 0
	}

	return (
		<div
			style={{
				position: "relative",
				width: width + "px",
				height: height + "px",
			}}
		>
			<div
				style={{
					position: "relative",
					width: "100%",
					height: "50%",
					marginTop: "25%",
					borderRadius: "6px",
					backgroundColor: "#aaa",
				}}
			>
				<div
					ref={knob}
					style={{
						position: "absolute",
						left: (value * 100) + "%",
						width: "10%",
						height: "100%",
						borderRadius: "6px",
						backgroundColor: "cyan",
					}}
				></div>
			</div>
		</div>
	);
}
