import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
	createBrowserRouter,
	RouterProvider,
	// Route,
	// Link,
} from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";
import ThreeJsScene from "./pages/ThreeJsScene";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/interpreter",
				element: <ThreeJsScene />,
			},
			{
				path: "/playglbanimation",
				element: <ThreeJsScene />,
			},
			{
				path: "/playfbxanimation",
				element: <ThreeJsScene />,
			},
			{
				path: "/motionsync",
				element: <ThreeJsScene />,
			},
			{
				path: "/motionsyncglb",
				element: <ThreeJsScene />,
			},
			{
				path: "/motionsyncglbblaze",
				element: <ThreeJsScene />,
			},
			{
				path: "/motionsyncglbblazearithmetic",
				element: <ThreeJsScene />,
			},
			{
				path: "/posesync",
				element: <ThreeJsScene />,
			},
		],
	},
]);

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
