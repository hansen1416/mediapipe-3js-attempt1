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
import TrainingExplore from "./pages/TrainingExplore";
import MotionInterpreter from "./pages/MotionInterpreter";
import TrainingBuilder from "./pages/TrainingBuilder";
import DigitalTrainer from "./pages/DigitalTrainer";
import Register from "./pages/Auth/Register";
import ParticleFigure from "./pages/ParticleFigure";
import Site from "./pages/Site";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/register",
				element: <Register />,
			},
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/interpreter",
				element: <MotionInterpreter />,
			},
			{
				path: "/training-explore",
				element: <TrainingExplore />,
			},
			{
				path: "/training-builder",
				element: <TrainingBuilder />,
			},
			{
				path: "/digital-trainer",
				element: <DigitalTrainer />,
			},
			{
				path: "/cloud",
				element: <ParticleFigure />,
			},
			{
				path: "/site",
				element: <Site />,
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
