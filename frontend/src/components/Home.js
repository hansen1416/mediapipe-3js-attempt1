import { useEffect, useRef } from "react";
import "./Home.css";

import MatchMan from "./MatchMan";

export default function Home() {
	useEffect(() => {}, []);

	return (
		<div className="box">
			<MatchMan />
		</div>
	);
}
