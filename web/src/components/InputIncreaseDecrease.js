import "../styles/css/InputIncreaseDecrease.css";

export default function InputIncreaseDecrease({ value, onChange }) {
	return (
		<div className="input-increase-descrease">
			<div
				className="value-button decrease"
				onClick={() => {
					onChange(Number(value - 1));
				}}
			>
				-
			</div>
			<input
				type="number"
				value={value}
				onChange={(e) => {
					onChange(Number(e.target.value));
				}}
			/>
			<div
				className="value-button increase"
				onClick={() => {
					onChange(Number(value + 1));
				}}
			>
				+
			</div>
		</div>
	);
}
