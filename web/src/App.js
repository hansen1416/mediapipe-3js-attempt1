import { Link, Outlet } from "react-router-dom";
import "./styles/css/App.css";

function App() {
	return (
		<div className="App">
			<Outlet />
			<nav>
				<div>
					<Link to={`/interpreter`}>Interpreter</Link>
				</div>
				<div>
					<Link to={`/excercise-editor`}>Excercis Editor</Link>
				</div>
				<div>
					<Link to={`/digital-trainer`}>Digital Trainer</Link>
				</div>
			</nav>
		</div>
	);
}

export default App;
