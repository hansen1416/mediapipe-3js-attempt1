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
import MotionInterpreter from "./pages/MotionInterpreter";
import ExcerciseEditor from "./pages/ExcerciseEditor";
import DigitalTrainer from "./pages/DigitalTrainer";
import CloudRove from "./pages/CloudRove";
import Register from "./pages/Auth/Register";
import ParticleFigure from "./pages/ParticleFigure";
import Site from "./pages/Site";
import PoseMapping from "./pages/PoseMapping";

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
				element: <MotionInterpreter />,
			},
			{
				path: "/excercise-editor",
				element: <ExcerciseEditor />,
			},
			{
				path: "/digital-trainer",
				element: <DigitalTrainer />,
			},
			{
				path: "/cloud-rove",
				element: <CloudRove />,
			},
			{
				path: "/register",
				element: <Register />,
			},
			{
				path: "/cloud",
				element: <ParticleFigure />,
			},
			{
				path: "/site",
				element: <Site />,
			},
			{
				path: "/mapping",
				element: <PoseMapping />,
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
