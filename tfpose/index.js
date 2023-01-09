// Load the binding
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs')
const path = require('path')

function prepareImage(input, inputSize) {
    if (!input.shape || !input.shape[1] || !input.shape[2]) return input;
    padding = [
      [0, 0], // dont touch batch
      [input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0, input.shape[2] > input.shape[1] ? Math.trunc((input.shape[2] - input.shape[1]) / 2) : 0], // height before&after
      [input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0, input.shape[1] > input.shape[2] ? Math.trunc((input.shape[1] - input.shape[2]) / 2) : 0], // width before&after
      [0, 0], // dont touch rbg
    ];
    const padT = tf.pad(input, padding);
    const resizeT = tf.image.resizeBilinear(padT, [inputSize, inputSize]);
    tf.dispose(padT);
    return resizeT;
}

async function loadModel(model_path) {

    const handler = tf.io.fileSystem(model_path);

    const model = await tf.loadGraphModel(handler);

    console.log(model)
    return model
}


const img_path = path.join('frames', '6packs.mp4', 'frame_1672991373415_1280x720_5.jpg')

const img_data = fs.readFileSync(img_path)

const img_tensor3d = tf.node.decodeJpeg(img_data)

const img_tensor4d = tf.tensor4d([img_tensor3d.arraySync()])

// console.log(img_tensor4d);

const resized_tensor = prepareImage(img_tensor4d, 224);

const detectorPath = path.join('models', 'tfjs-model_blazepose_3d_detector_1', 'model.json');

// // helper function: wrapper around console output
// function log(...msg) {
//     const dt = new Date();
//     const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
//     // eslint-disable-next-line no-console
//     if (msg) console.log(ts, ...msg);
//   }
  


// async function decodeResults(res, config) {
//     log('decodeResults', { res, config });
//     const box = [0, 0, 1, 1]; // [x1,y1,x2,y2]
//     const boxes = [];
//     boxes.push(box);
//     return boxes;
//   }


(async() => {

    const model = await loadModel(detectorPath);

    const result_tensor = await model.execute(resized_tensor)

    console.log(result_tensor)

})();

function getInputSize(model) {

    const inputs = Object.values(model.modelSignature['inputs']);

    /**
     * {dim: [ { size: '-1' }, { size: '224' }, { size: '224' }, { size: '3' } ]}
     */
    console.log(inputs[0].tensorShape)

    const inputSize = [0, 0];

    inputSize[0] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[1].size) : 0;
    inputSize[1] = Array.isArray(inputs) ? parseInt(inputs[0].tensorShape.dim[2].size) : 0;

    // [ 224, 224 ]
    // console.log(inputSize)
    return inputSize
}

// exit()

// 
// const posePath = path.join('models', 'tfjs-model_blazepose_3d_landmark_heavy_2', 'model.json');

// (async() => {
//     const detectorModel = await loadModel(detectorPath);

//     const detectorInputsize = getInputSize(detectorModel)

//     // console.log(detectorInputsize);

//     const poseModel = await loadModel(posePath);

//     /**
//     if (config.body.modelPath?.includes('lite')) outputNodes = ['ld_3d', 'output_segmentation', 'output_heatmap', 'world_3d', 'output_poseflag'];
//     else outputNodes = ['Identity', 'Identity_2', 'Identity_3', 'Identity_4', 'Identity_1']; // v2 from pinto full and heavy
//      */

//     const outputNodes = ['Identity', 'Identity_2', 'Identity_3', 'Identity_4', 'Identity_1'];

//     // console.log(poseModel)

//     const poseInputsize = getInputSize(poseModel);

//     console.log(poseInputsize)

// })();

