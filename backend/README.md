## Solution APIs
__Cross-platform Configuration Options__

### `STATIC_IMAGE_MODE`

If set to `false`, the solution treats the input images as a video stream. It will try to detect the most prominent person in the very first images, and upon a successful detection further localizes the pose landmarks. In subsequent images, it then __simply tracks those landmarks without invoking another detection until it loses track__, on reducing computation and latency. If set to true, person detection runs every input image, ideal for processing a batch of static, possibly unrelated, images. Default to false.


### `MODEL_COMPLEXITY`

Complexity of the pose landmark model: `0`, `1` or `2`. Landmark __accuracy as well as inference latency generally go up__ with the model complexity. Default to `1`.

### SMOOTH_LANDMARKS

If set to `true`, the solution filters pose landmarks across different input images to reduce jitter, but ignored if `static_image_mode` is also set to true. Default to `true`.

### ENABLE_SEGMENTATION

If set to `true`, in addition to the pose landmarks the solution also generates the segmentation mask. Default to `false`.

### SMOOTH_SEGMENTATION

If set to `true`, the solution filters segmentation masks across different input images to reduce jitter. Ignored if `enable_segmentation` is `false` or `static_image_mode` is `true`. Default to `true`.

### MIN_DETECTION_CONFIDENCE

Minimum confidence value `([0.0, 1.0])` from the person-detection model for the detection to be considered successful. Default to `0.5`.

### MIN_TRACKING_CONFIDENCE

Minimum confidence value ([0.0, 1.0]) from the landmark-tracking model for the pose landmarks to be considered tracked successfully, or otherwise person detection will be invoked automatically on the next input image. Setting it to a higher value can increase robustness of the solution, at the expense of a higher latency. Ignored if `static_image_mode` is `true`, where person detection simply runs on every image. Default to `0.5`.


__Output__

### POSE_LANDMARKS

A list of pose landmarks. Each landmark consists of the following:

- `x` and `y`: Landmark coordinates normalized to `[0.0, 1.0]` by the image width and height respectively.
- `z`: Represents the landmark depth with the depth at the midpoint of hips being the origin, and the smaller the value the closer the landmark is to the camera. The magnitude of `z` uses roughly the same scale as `x`.
- `visibility`: A value in `[0.0, 1.0]` indicating the likelihood of the landmark being visible (present and not occluded) in the image.

### POSE_WORLD_LANDMARKS

Another list of pose landmarks in world coordinates. Each landmark consists of the following:

- `x`, `y` and `z`: Real-world 3D coordinates in meters with the origin at the center between hips.
- `visibility`: Identical to that defined in the corresponding `pose_landmarks`.


### SEGMENTATION_MASK

The output segmentation mask, predicted only when `enable_segmentation` is set to `true`. The mask has the same width and height as the input image, and contains values in `[0.0, 1.0]` where `1.0` and `0.0` indicate high certainty of a “human” and “background” pixel respectively.