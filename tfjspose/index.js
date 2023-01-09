const poseDetection = require("@tensorflow-models/pose-detection");
const path = require('path')

const BlazePoseConfig = {
	// runtime: "mediapipe", // or 'tfjs'
	runtime: "tfjs",
	enableSmoothing: true,
	modelType: "heavy",
	// detectorModelUrl: 
    // // 'C:\Users\105476\Documents\my-app\tfjspose\models\tfjs-model_blazepose_3d_detector_1\model.json',
    // path.join('C:', 'Users','105476','Documents','my-app','tfjspose','models', 'tfjs-model_blazepose_3d_detector_1', 'model.json'),
	// landmarkModelUrl: 
    // // 'C:\Users\105476\Documents\my-app\tfjspose\models\tfjs-model_blazepose_3d_landmark_full_2\model.json',
    // path.join('C:', 'Users','105476','Documents','my-app','tfjspose','models', 'tfjs-model_blazepose_3d_landmark_full_2', 'model.json'),
	// solutionPath: process.env.PUBLIC_URL + `/models/mediapipe/pose`,
};

(async() => {
    const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        BlazePoseConfig
    )


    console.log(detector)
})();

