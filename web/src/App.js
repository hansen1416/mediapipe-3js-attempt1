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
						<Link to={`/playglbanimation`}>Play GLB animation</Link>
					</li>
					<li>
						<Link to={`/motionsync`}>Motion Sync</Link>
					</li>
					<li>
						<Link to={`/motionsyncglb`}>Motion Sync GLB</Link>
					</li>
					<li>
						<Link to={`/motionsyncglbblaze`}>
							Motion Sync GLB Blaze
						</Link>
					</li>
					<li>
						<Link to={`/motionsyncglbblazearithmetic`}>
							Motion Sync Arithmetic
						</Link>
					</li>
				</ul>
			</nav>
		</div>
	);
}

export default App;
