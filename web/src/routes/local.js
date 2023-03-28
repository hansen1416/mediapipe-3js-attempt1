import App from "../App";
import ErrorPage from "../pages/ErrorPage";
import MotionInterpreter from "../local/MotionInterpreter";
import MotionInterpreterFbx from "../local/MotionInterpreterFbx";
import GeometryFigure from "../local/GeometryFigure";
import Site from "../local/Site";
import GLBModel from "../local/GLBModel";
import PoseDiffScore from "../local/PoseDiffScore";
import PoseVectorDeviation from "../local/PoseVectorDeviation";

export default [
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
                path: "/glb-model",
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
        ],
    }
];