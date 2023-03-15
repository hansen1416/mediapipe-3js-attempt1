import { useState } from "react";
import { Outlet } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/css/App.css";

// Default theme
// import '@splidejs/react-splide/css';
// or other themes
// import '@splidejs/react-splide/css/skyblue';
import '@splidejs/react-splide/css/sea-green';
// // or only core styles
import '@splidejs/react-splide/css/core';

function App() {
	const [theme] = useState("light");

	return (
		<div className={`App ${theme}`}>
			<Outlet />
			<Nav defaultActiveKey="/digital-trainer" className="flex-row">
				<Nav.Link href="/training-explore">Explore</Nav.Link>
				<Nav.Link href="/training-builder">Builder</Nav.Link>
				<Nav.Link href="/digital-trainer">D-trainer</Nav.Link>
				{/* <Nav.Link href="/interpreter">Active</Nav.Link> */}
				{/* <Nav.Link href="/cloud">figures</Nav.Link> */}
				{/* <Nav.Link href="/site">site</Nav.Link> */}
				{/* <Nav.Link href="/mapping">mapping</Nav.Link> */}
			</Nav>
		</div>
	);
}

export default App;
