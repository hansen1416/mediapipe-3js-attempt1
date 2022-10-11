import { Link, Outlet } from "react-router-dom";
import "./App.css";

function App() {
	return (
		<div className="App">
			<nav>
				<ul>
					<li>
						<Link to={`/`}>Home</Link>
					</li>
					<li>
						<Link to={`/upload`}>Upload</Link>
					</li>
				</ul>
			</nav>
			<Outlet />
		</div>
	);
}

export default App;
