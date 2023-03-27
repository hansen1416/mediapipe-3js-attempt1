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
import TrainingBuilder from "./pages/TrainingBuilder";
import TrainingReport from "./pages/TrainingReport";
import DigitalTrainer from "./pages/DigitalTrainer";
import Register from "./pages/Register";

import MotionInterpreter from "./testing/MotionInterpreter";
import MotionInterpreterFbx from "./testing/MotionInterpreterFbx";
import ParticleFigure from "./testing/ParticleFigure";
import Site from "./testing/Site";
import GLBModel from "./testing/GLBModel";
import PoseDiffScore from "./testing/PoseDiffScore";
import PoseVectorDiveation from "./testing/PoseVectorDiveation";

const production_routes = [
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
				path: "/training-explore",
				element: <TrainingExplore />,
			},
			{
				path: "/training-builder",
				element: <TrainingBuilder />,
			},
			{
				path: "/training-report",
				element: <TrainingReport />,
			},
			{
				path: "/digital-trainer",
				element: <DigitalTrainer />,
			},
		],
	},
];

const testing_routees =
	process.env.NODE_ENV === "production"
		? []
		: {
				path: "/",
				element: <App />,
				errorElement: <ErrorPage />,
				children: [
					{
						path: "/cloud",
						element: <ParticleFigure />,
					},
					{
						path: "/site",
						element: <Site />,
					},
					{
						path: "/interpreter",
						element: <MotionInterpreter />,
					},
					{
						path: "/interpreterfbx",
						element: <MotionInterpreterFbx />,
					},
					{
						path: "/glb-model",
						element: <GLBModel />,
					},
					{
						path: "/score",
						element: <PoseDiffScore />,
					},
					{
						path: "/diveation",
						element: <PoseVectorDiveation />,
					},
				],
		  };

const router = createBrowserRouter(production_routes.concat(testing_routees));

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
