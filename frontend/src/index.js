import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
	createBrowserRouter,
	RouterProvider,
	// Route,
	// Link,
} from "react-router-dom";
import ErrorPage from "./ErrorPage";
import Home from "./components/Home";
import MatchMan from "./components/MatchMan";
import GreenMan from "./components/GreenMan";
import BufferGeoModel from "./components/BufferGeoModel";
import Upload from "./components/Upload";
import Video from "./components/Video";
import WebCamera from "./components/WebCamera";
import Playground3D from "./components/Playground3D";

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
				path: "/greenman",
				element: <GreenMan />,
			},
			{
				path: "/matchman",
				element: <MatchMan />,
			},
			{
				path: "/buffergeo",
				element: <BufferGeoModel />,
			},
			{
				path: "/3dplayground",
				element: <Playground3D />,
			},
			{
				path: "/upload",
				element: <Upload />,
			},
			{
				path: "/video",
				element: <Video />,
			},
			{
				path: "/camera",
				element: <WebCamera />,
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
