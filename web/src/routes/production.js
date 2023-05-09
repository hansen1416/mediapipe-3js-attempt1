import App from "../App";
import ErrorPage from "../pages/ErrorPage";
import Home from "../pages/Home";
import TrainingExplore from "../pages/TrainingExplore";
import TrainingBuilder from "../pages/TrainingBuilder";
import TrainingReport from "../pages/TrainingReport";
import DigitalTrainer from "../pages/DigitalTrainer";
import Register from "../pages/Register";
import Game from "../pages/Game";

const routes = [
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
			{
				path: "/game",
				element: <Game />,
			},
		],
	},
];

export default routes;
