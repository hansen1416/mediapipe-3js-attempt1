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
import MatchMan from "./pages/MatchMan";
import GreenMan from "./pages/GreenMan";
import BufferGeoModel from "./pages/BufferGeoModel";
import Upload from "./pages/Upload";
import Video from "./pages/Video";
import WebCamera from "./pages/WebCamera";
import Playground3D from "./pages/Playground3D";
import GLBModelStatic from "./pages/GLBModelStatic";
import GLBModel from "./pages/GLBModel";

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
				path: "/glbmodelstatic",
				element: <GLBModelStatic />,
			},
			{
				path: "/glbmodel",
				element: <GLBModel />,
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
