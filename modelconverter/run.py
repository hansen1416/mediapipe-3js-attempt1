import os

import tensorflow as tf
import tfjs_graph_converter.api as tfjs

# print(tf.lite)
# print(tfjs)


tfjs.graph_model_to_saved_model(
    os.path.join(
        'models', 'tfjs-model_blazepose_3d_detector_1', 'model.json'),
    os.path.join('./', 'output'),
)

# # Code below taken from https://www.tensorflow.org/lite/convert/python_api
# converter = tf.lite.TFLiteConverter.from_saved_model("realsavedmodel")
# tflite_model = converter.convert()

# # Save the TF Lite model.
# with tf.io.gfile.GFile('model.tflite', 'wb') as f:
#     f.write(tflite_model)
