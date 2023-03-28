import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import {
	createBrowserRouter,
	RouterProvider,
	// Route,
	// Link,
} from "react-router-dom";

// const local_routes = await import('./routes/local');
// const production_routes = await import('./routes/production');

if (process.env.NODE_ENV === 'production') {

	Promise.all([
		import('./routes/production')
	]).then(([production_routes]) => {
	
		const router = createBrowserRouter(production_routes.default);
	
		const root = ReactDOM.createRoot(document.getElementById("root"));
		root.render(
			// <React.StrictMode>
			<RouterProvider router={router} />
			// </React.StrictMode>
		);
	
		// If you want to start measuring performance in your app, pass a function
		// to log results (for example: reportWebVitals(console.log))
		// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
		reportWebVitals();
	
	})
} else {

	Promise.all([
		import('./routes/production'),
		import('./routes/local')
	]).then(([production_routes, local_routes]) => {
	
		const router = createBrowserRouter(production_routes.default.concat(local_routes.default));
	
		const root = ReactDOM.createRoot(document.getElementById("root"));
		root.render(
			// <React.StrictMode>
			<RouterProvider router={router} />
			// </React.StrictMode>
		);
	
		// If you want to start measuring performance in your app, pass a function
		// to log results (for example: reportWebVitals(console.log))
		// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
		reportWebVitals();
	
	})
}
