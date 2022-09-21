import os
import sys
import tempfile
import time

import cv2
import mediapipe as mp
import imageio.v3 as iio
import numpy as np
from PIL import Image
import pickle
from mediapipe.python.solutions import pose
from mediapipe.python.solutions.pose import PoseLandmark
from mediapipe.framework.formats.landmark_pb2 import NormalizedLandmark
# from mediapipe.framework.formats.landmark_pb2 import LandmarkList
# from google.protobuf.pyext._message import RepeatedCompositeContainer

from logger import logger

MEDIA_DIR = os.path.join('.', 'media')
POSE_DATA_DIR = os.path.join('.', 'pose_data')

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


class PreprocessVideo():

    def __init__(self, video_path) -> None:
        self.cap = cv2.VideoCapture(video_path)

        # logger.info(sys.getsizeof(cap))

        total_frames = self.cap.get(cv2.CAP_PROP_FRAME_COUNT)
        print('video frames :', total_frames)

        fps = self.cap.get(cv2.CAP_PROP_FPS)
        print('video fps :', fps)

        self.frames_steps = 1

    def __del__(self):
        self.cap.release()
        logger.info("Release video")

    def save_video_poses(self):

        count = 0

        pose_landmarks = []
        pose_world_landmarks = []
        segment_masks = []

        with mp_pose.Pose(static_image_mode=False,
                          model_complexity=2,
                          enable_segmentation=True,
                          min_detection_confidence=0.5) as pose:

            while self.cap.isOpened():
                ret, frame = self.cap.read()

                
                # count += self.frames_steps  # i.e. at 30 fps, this advances one second
                # self.cap.set(cv2.CAP_PROP_POS_FRAMES, count)

                if ret:

                    results = pose.process(
                        cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

                    if not results.pose_landmarks:
                        pose_landmarks.append(pickle.dumps(None))
                        pose_world_landmarks.append(pickle.dumps(None))
                        segment_masks.append(results.segmentation_mask)
                    else:
                        pose_landmarks.append(pickle.dumps(results.pose_landmarks))
                        pose_world_landmarks.append(pickle.dumps(results.pose_world_landmarks))
                        segment_masks.append(np.zeros(frame.shape, dtype=np.uint8))

                    if count and (count % 3000) == 0:
                        frame_start_end = str(count-3000) + '-' + str(count)

                        np.save(os.path.join(POSE_DATA_DIR, 'lm{}.npy'.format(frame_start_end)), pose_landmarks)
                        np.save(os.path.join(POSE_DATA_DIR, 'wlm{}.npy'.format(frame_start_end)), pose_world_landmarks)
                        np.save(os.path.join(POSE_DATA_DIR, 'sm{}.npy'.format(frame_start_end)), segment_masks)

                        logger.info("Save pose landmark and segmentation masks for {}".format(frame_start_end))

                        pose_landmarks = []
                        pose_world_landmarks = []
                        segment_masks = []

                    count += 1
                    
                else:
                    # set to video start
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    
                    if len(pose_landmarks):
                        frame_start_end = str(count - count % 3000) + '-' + str(count)

                        np.save(os.path.join(POSE_DATA_DIR, 'lm{}.npy'.format(frame_start_end)), pose_landmarks)
                        np.save(os.path.join(POSE_DATA_DIR, 'wlm{}.npy'.format(frame_start_end)), pose_world_landmarks)
                        np.save(os.path.join(POSE_DATA_DIR, 'sm{}.npy'.format(frame_start_end)), segment_masks)

                        logger.info("Save pose landmark and segmentation masks for {}".format(frame_start_end))

                    break

        # np.save(os.path.join(POSE_DATA_DIR, 'pose_data_bytes.npy'), pose_data)

    def display_pose_for_frame(self, video_frame, pose_landmark, segmentation_mask=None):

        # Draw pose landmarks on the image.
        mp_drawing.draw_landmarks(
            video_frame,
            pose_landmark,
            mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())

        cv2.imwrite('./tmp/frame_pose{}.png'.format(int(time.time())), video_frame)

    def show_pose_for_frame(self, pose_npy_path, frame_index):

        self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index*self.frames_steps)

        ret, video_frame = self.cap.read()

        if not ret:
            logger.info("Read video frame false")
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            return

        logger.info(video_frame.shape)

        pose_data = np.load(pose_npy_path, allow_pickle=True)

        frame_pose_landmark = pose_data[frame_index]

        if frame_pose_landmark is None:
            logger.info("no pose for frame {}".format(frame_index))
            cv2.imwrite(
                './tmp/frame_pose{}_empty.png'.format(frame_index), video_frame)
            return

        frame_pose_landmark: PoseLandmark = pickle.loads(frame_pose_landmark)

        # Draw pose landmarks on the image.
        mp_drawing.draw_landmarks(
            video_frame,
            frame_pose_landmark,
            mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())

        cv2.imwrite('./tmp/frame_pose{}.png'.format(frame_index), video_frame)

    def calculate_static_pose(self):

        PoseLandmark.NOSE

        PoseLandmark.LEFT_SHOULDER
        PoseLandmark.RIGHT_SHOULDER
        PoseLandmark.LEFT_ELBOW
        PoseLandmark.RIGHT_ELBOW
        PoseLandmark.LEFT_WRIST
        PoseLandmark.RIGHT_WRIST

        PoseLandmark.LEFT_HIP
        PoseLandmark.RIGHT_HIP
        PoseLandmark.LEFT_KNEE
        PoseLandmark.RIGHT_KNEE
        PoseLandmark.LEFT_ANKLE
        PoseLandmark.RIGHT_ANKLE


if __name__ == "__main__":

    video_file = os.path.join(MEDIA_DIR, 'yoga.mp4')

    processer = PreprocessVideo(video_file)

    processer.save_video_poses()

    # for i in range(100, 131):
    #     processer.show_pose_for_frame(os.path.join(
    #         POSE_DATA_DIR, 'pose_data_bytes.npy'), i)

    # for frame in iio.imiter(video_file, plugin="pyav", format="rgb24", thread_type="FRAME"):

    #     # with tempfile.NamedTemporaryFile() as f:

    #     # print(frame.shape)

    #     # img = Image.fromarray(frame)
    #     # img.save(f, format='jpeg')

    #     # imgf = cv2.imread(f.name)

    #     # print(imgf.shape)

    #     image_height, image_width, _ = frame.shape

    #     with mp_pose.Pose(static_image_mode=False,
    #                       model_complexity=2,
    #                       enable_segmentation=True,
    #                       min_detection_confidence=0.5) as pose:

    #         results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    #         if not results.pose_landmarks:
    #             continue
    #         # print(
    #         #     f'Nose coordinates: ('
    #         #     f'{results.pose_landmarks.landmark[mp_pose.PoseLandmark.NOSE].x * image_width}, '
    #         #     f'{results.pose_landmarks.landmark[mp_pose.PoseLandmark.NOSE].y * image_height})'
    #         # )

    #         pose_lm: PoseLandmark = results.pose_landmarks.landmark
    #         pose_wolrd_lm = results.pose_world_landmarks
    #         segm_mask: np.ndarray = results.segmentation_mask

    #         print(pose_lm[mp_pose.PoseLandmark.LEFT_ELBOW])

    #         print(pose_lm[mp_pose.PoseLandmark.NOSE])
    #         # print(pose_wolrd_lm)
    #         for poselm in PoseLandmark:
    #             print(PoseLandmark[poselm.name].value)

    #         # print(results.segmentation_mask.shape)
    #         # annotated_image = results.segmentation_mask
    #         # annotated_image = frame.copy()
    #         # bg_image = np.zeros(frame.shape, dtype=np.uint8)

    #         # condition = np.stack(
    #         #     (results.segmentation_mask,) * 3, axis=-1) > 0.1

    #         # annotated_image = np.where(condition, annotated_image, bg_image)

    #         # # print(annotated_image.shape)

    #         # # Draw pose landmarks on the image.
    #         # mp_drawing.draw_landmarks(
    #         #     annotated_image,
    #         #     results.pose_landmarks,
    #         #     mp_pose.POSE_CONNECTIONS,
    #         #     landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())
    #         # cv2.imwrite('./tmp/annotated_image0.png', annotated_image)

    #         # lines = np.stack((results.segmentation_mask,) * 3, axis=-1)

    #         # # Draw pose landmarks on the image.
    #         # mp_drawing.draw_landmarks(
    #         #     lines,
    #         #     results.pose_landmarks,
    #         #     mp_pose.POSE_CONNECTIONS,
    #         #     landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())
    #         # cv2.imwrite('./tmp/lines_image0.png', lines)

    #         # Plot pose world landmarks.
    #         # for i in results.pose_world_landmarks:

    #     break
