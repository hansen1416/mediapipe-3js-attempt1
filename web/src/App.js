import { Link, Outlet } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import "./styles/css/App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
	return (
		<div className="App">
			<Outlet />
			<div style={{ position: "absolute", top: "3%", right: "2%" }}>
				<Nav
					defaultActiveKey="/digital-trainer"
					className="flex-column"
				>
					{/* <Nav.Link href="/interpreter">Active</Nav.Link> */}
					<Link href="/excercise-editor">excercise-editor</Link>
					<Link href="/digital-trainer">digital-trainer</Link>
				</Nav>
			</div>
		</div>
	);
}

export default App;
