import { Link, Outlet } from "react-router-dom";
import "./App.css";

function App() {
	return (
		<div className="App">
			<Outlet />
			<nav>
				<ul>
					<li>
						<Link to={`/interpreter`}>Interpreter</Link>
					</li>
					<li>
						<Link to={`/excercise-editor`}>Excercis Editor</Link>
					</li>
					<li>
						<Link to={`/digital-trainer`}>Digital Trainer</Link>
					</li>
				</ul>
			</nav>
		</div>
	);
}

export default App;
