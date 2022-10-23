import { Link, Outlet } from "react-router-dom";
import "./App.css";

function App() {
	return (
		<div className="App">
			<Outlet />
			<nav>
				<ul>
					<li>
						<Link to={`/`}>Home</Link>
					</li>
					<li>
						<Link to={`/upload`}>Upload</Link>
					</li>
					<li>
						<Link to={`/video`}>Video</Link>
					</li>
					<li>
						<Link to={`/camera`}>Camera</Link>
					</li>
				</ul>
			</nav>
		</div>
	);
}

export default App;
