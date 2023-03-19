import { useState } from "react";
import { Outlet } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/css/App.css";

// Default theme
// import '@splidejs/react-splide/css';
// or other themes
// import '@splidejs/react-splide/css/skyblue';
import "@splidejs/react-splide/css/sea-green";
// // or only core styles
import "@splidejs/react-splide/css/core";

import { ReactComponent as DarkSvg } from "./svg/sun.svg";
import { ReactComponent as LightSvg } from "./svg/sun-light.svg";

function App() {
	const [theme, settheme] = useState("dark");

	return (
		<div className={`App ${theme}`}>
			<Outlet />

			<Nav
				defaultActiveKey="/digital-trainer"
				className="justify-content-center"
			>
				<Nav.Link href="/training-explore">Explore</Nav.Link>
				<Nav.Link href="/training-builder">Builder</Nav.Link>
				<Nav.Link href="/digital-trainer">D-trainer</Nav.Link>
				{/* <Nav.Link href="/interpreter">Active</Nav.Link> */}
				{/* <Nav.Link href="/cloud">figures</Nav.Link> */}
				{/* <Nav.Link href="/site">site</Nav.Link> */}
				{/* <Nav.Link href="/mapping">mapping</Nav.Link> */}
				<div className="controls">
					<div
						onClick={() => {
							settheme(theme === "dark" ? "light" : "dark");
						}}
					>
						{theme === "dark" ? <LightSvg /> : <DarkSvg />}
					</div>
				</div>
			</Nav>
		</div>
	);
}

export default App;
