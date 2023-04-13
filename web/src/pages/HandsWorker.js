import { Hands } from "@mediapipe/hands";

let handDetector;
let modelReady = false

export function initModel() {
    handDetector = new Hands({
        locateFile: (file) => {
            return process.env.PUBLIC_URL + `/mediapipe/hands/${file}`;
            // return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
    });
    handDetector.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        static_image_mode: false,
    });
    handDetector.onResults(onHandCallback);

    handDetector.initialize().then(() => {
        console.log(2)
        modelReady = true
    })
}

export function plotHands(data) {
    if (!modelReady) {
        return
    }


}