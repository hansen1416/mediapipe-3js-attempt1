import os
import sys
import tempfile

import cv2
import mediapipe as mp
from mediapipe.python.solutions import pose
import imageio.v3 as iio
import numpy as np
from PIL import Image

MEDIA_DIR = os.path.join('.', 'media')

mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_pose: pose = mp.solutions.pose


class PoseDetector:

    def __init__(self, mode=False, upBody=False, smooth=True, detectionCon=0.5, trackCon=0.5):

        self.mode = mode
        self.upBody = upBody
        self.smooth = smooth
        self.detectionCon = detectionCon
        self.trackCon = trackCon

        self.mpDraw = mp.solutions.drawing_utils
        self.mpPose = mp.solutions.pose
        self.pose = self.mpPose.Pose(
            self.mode, self.upBody, self.smooth, self.detectionCon, self.trackCon)

    def findPose(self, img, draw=True):
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.results = self.pose.process(imgRGB)
        if self.results.pose_landmarks:
            if draw:
                self.mpDraw.draw_landmarks(
                    img, self.results.pose_landmarks, self.mpPose.POSE_CONNECTIONS)

        return img, self.results.pose_landmarks, self.mpPose.POSE_CONNECTIONS

    def getPosition(self, img, draw=True):
        lmList = []
        if self.results.pose_landmarks:
            for id, lm in enumerate(self.results.pose_landmarks.landmark):
                h, w, c = img.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                lmList.append([id, cx, cy])
                if draw:
                    cv2.circle(img, (cx, cy), 5, (255, 0, 0), cv2.FILLED)
        return lmList


if __name__ == "__main__":

    video_file = os.path.join(MEDIA_DIR, '6packs.mp4')

    for frame in iio.imiter(video_file, plugin="pyav", format="rgb24", thread_type="FRAME"):

        # with tempfile.NamedTemporaryFile() as f:

        # print(frame.shape)

        # img = Image.fromarray(frame)
        # img.save(f, format='jpeg')

        # imgf = cv2.imread(f.name)

        # print(imgf.shape)

        image_height, image_width, _ = frame.shape

        with mp_pose.Pose(static_image_mode=False,
                          model_complexity=2,
                          enable_segmentation=True,
                          min_detection_confidence=0.5) as pose:

            results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            # print(results)

            if not results.pose_landmarks:
                continue
            print(
                f'Nose coordinates: ('
                f'{results.pose_landmarks.landmark[mp_pose.PoseLandmark.NOSE].x * image_width}, '
                f'{results.pose_landmarks.landmark[mp_pose.PoseLandmark.NOSE].y * image_height})'
            )

            # print(results.segmentation_mask.shape)
            # annotated_image = results.segmentation_mask
            # annotated_image = frame.copy()
            # bg_image = np.zeros(frame.shape, dtype=np.uint8)

            # condition = np.stack(
            #     (results.segmentation_mask,) * 3, axis=-1) > 0.1

            # annotated_image = np.where(condition, annotated_image, bg_image)

            # # print(annotated_image.shape)

            # # Draw pose landmarks on the image.
            # mp_drawing.draw_landmarks(
            #     annotated_image,
            #     results.pose_landmarks,
            #     mp_pose.POSE_CONNECTIONS,
            #     landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())
            # cv2.imwrite('./tmp/annotated_image0.png', annotated_image)

            # lines = np.stack((results.segmentation_mask,) * 3, axis=-1)

            # # Draw pose landmarks on the image.
            # mp_drawing.draw_landmarks(
            #     lines,
            #     results.pose_landmarks,
            #     mp_pose.POSE_CONNECTIONS,
            #     landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())
            # cv2.imwrite('./tmp/lines_image0.png', lines)

            # Plot pose world landmarks.
            # for i in results.pose_world_landmarks:

            # print(results.pose_landmarks)
            print(results.pose_world_landmarks)

        break
