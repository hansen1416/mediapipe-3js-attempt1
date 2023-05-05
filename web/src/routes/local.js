import App from "../App";
import ErrorPage from "../pages/ErrorPage";
import MotionInterpreter from "../local/MotionInterpreter";
import MotionInterpreterFbx from "../local/MotionInterpreterFbx";
import GeometryFigure from "../local/GeometryFigure";
import Site from "../local/Site";
import GLBModel from "../local/GLBModel";
import PoseDiffScore from "../local/PoseDiffScore";
import PoseVectorDeviation from "../local/PoseVectorDeviation";
import CloudVagabond1 from "../local/CloudVagabond1";
import Dodgeverse from "../local/Dodgeverse";
import SMPLModel from "../local/SMPLModel";

const routes = [
	{
		path: "/",
		element: <App />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/figure",
				element: <GeometryFigure />,
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
				path: "/glb",
				element: <GLBModel />,
			},
			{
				path: "/score",
				element: <PoseDiffScore />,
			},
			{
				path: "/deviation",
				element: <PoseVectorDeviation />,
			},
			{
				path: "/vagabond1",
				element: <CloudVagabond1 />,
			},
			{
				path: "/dodgeverse",
				element: <Dodgeverse />,
			},
			{
				path: "/smpl",
				element: <SMPLModel />,
			},
		],
	},
];

export default routes;
