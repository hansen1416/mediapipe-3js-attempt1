import os
import time
from tempfile import NamedTemporaryFile

from collections import namedtuple
import cv2
from mpl_toolkits.mplot3d.proj3d import proj_transform
from mpl_toolkits.mplot3d.axes3d import Axes3D
from matplotlib.patches import FancyArrowPatch
from matplotlib.text import Annotation
import mediapipe as mp
from mediapipe.python.solutions import pose
from mediapipe.python.solutions.pose import PoseLandmark
import numpy as np
import pickle

from ropes import logger, redis_client
from oss_service import OSSService

# MEDIA_DIR = os.path.join('.', 'media')
# POSE_DATA_DIR = os.path.join('.', 'pose_data')

# mp_drawing = mp.solutions.drawing_utils
# mp_drawing_styles = mp.solutions.drawing_styles
mp_pose: pose = mp.solutions.pose

# from gist https://gist.github.com/WetHat/1d6cd0f7309535311a539b42cccca89c


class VideoProcesser():

    def __init__(self, file_key, start_time, end_time) -> None:

        self.oss_key = file_key
        self.oss_svc = None

        if os.getenv('FLASK_DEBUG'):
            self.video_path = file_key
        else:
            self.oss_svc = OSSService()
            self.video_path = self.oss_svc.remote_to_stream(file_key)

        self.cap = cv2.VideoCapture(self.video_path)

        total_frames = self.cap.get(cv2.CAP_PROP_FRAME_COUNT)
        fps = self.cap.get(cv2.CAP_PROP_FPS)

        logger.info('video filename {}, frames {}, fps {}, total time {}'.format(
            self.video_path, total_frames, fps, round(total_frames/fps, 2)))

        if end_time < 0:
            self.end_frame = total_frames
        else:
            self.end_frame = min(round(end_time * fps), total_frames)

        self.start_frame = round(start_time * fps)

        assert self.start_frame < self.end_frame, "End time must be bigger than start time"

    def __del__(self):

        self.cap.release()

        # this was a tmp file
        # os.unlink(self.video_path)

        logger.info("Release video")

    def read_points_from_landmarks(self, landmarks):

        data = []

        for v in PoseLandmark:
            # print(v.name)
            # print(v.value)
            # data.append(landmarks[v.value])
            data.append([landmarks[v.value].x, landmarks[v.value].y,
                        landmarks[v.value].z, landmarks[v.value].visibility])

        # print(np.array(data).shape)
        # exit()

        # for j in landmarks:

        #     # data.append([landmarks[PoseLandmark[j]].x, landmarks[PoseLandmark[j]].y,
        #     #              landmarks[PoseLandmark[j]].z, landmarks[PoseLandmark[j]].visibility])

        return data

    def save_video_poses(self):

        logger.info('Saving pose from frame {} to {}'.format(
            self.start_frame, self.end_frame))

        count = self.start_frame

        self.cap.set(cv2.CAP_PROP_POS_FRAMES, self.start_frame)

        pose_world_landmarks = []
        pose_landmarks = []

        with mp_pose.Pose(static_image_mode=False,
                          model_complexity=2,
                          enable_segmentation=False,
                          min_detection_confidence=0.5) as pose:

            while self.cap.isOpened():
                ret, frame = self.cap.read()

                if ret:

                    results = pose.process(
                        cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

                    if not results.pose_landmarks:

                        pose_world_landmarks.append(np.zeros((33, 4)))
                        pose_landmarks.append(np.zeros((33, 4)))

                    else:

                        pose_world_landmarks.append(
                            self.read_points_from_landmarks(results.pose_world_landmarks.landmark))

                        # print(results.pose_world_landmarks)
                        pose_landmarks.append(
                            self.read_points_from_landmarks(results.pose_landmarks.landmark))

                    if count >= self.end_frame and len(pose_world_landmarks):

                        # frame_start_end = str(count - count % 300) + '-' + str(count)
                        frame_start_end = str(
                            self.start_frame) + '-' + str(self.end_frame)

                        self._save_data_file(
                            pose_world_landmarks, frame_start_end)

                        self._save_data_file2(pose_landmarks, frame_start_end)

                        pose_world_landmarks = []
                        pose_landmarks = []

                        logger.info(
                            "Save pose world landmark for {}".format(frame_start_end))

                        self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

                        break

                    # elif count and (count % 300) == 0 and len(pose_world_landmarks):

                    #     frame_start_end = str(count-300) + '-' + str(count)

                    #     self._save_data_file(pose_world_landmarks, frame_start_end)

                    #     pose_world_landmarks = []

                    #     logger.info(
                    #         "Save pose world landmark for {}".format(frame_start_end))

                    count += 1

                    # if count % 100 == 0:
                    # logger.info(count)

                # else:
                #     # when video finished

                #     # set to video start
                #     self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

                #     if len(pose_world_landmarks):

                #         frame_start_end = str(
                #             count - count % 300) + '-' + str(count)

                #         self._save_data_file(pose_world_landmarks, frame_start_end)

                #         logger.info(
                #             "Save pose world landmark for {}".format(frame_start_end))
                #     break

    def _save_data_file(self, pose_world_landmarks, frame_start_end):

        if self.oss_svc is None:

            dirname = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(dirname, 'pose_data')

            if not os.path.isdir(data_dir):
                os.makedirs(data_dir)

            # with open(os.path.join(data_dir, 'wlm{}.pkl'.format(frame_start_end)), 'wb') as f:
            #     pickle.dump(pose_world_landmarks, f)

            np.save(os.path.join(data_dir, 'wlm{}.npy'.format(
                frame_start_end)), pose_world_landmarks)
        else:
            with NamedTemporaryFile() as tf:
                # pickle.dump(pose_world_landmarks, tf)
                np.save(tf, pose_world_landmarks)

                self.oss_svc.simple_upload(
                    tf, self.oss_key + '/wlm{}.npy'.format(frame_start_end))

    def _save_data_file2(self, pose_landmarks, frame_start_end):

        if self.oss_svc is None:

            dirname = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(dirname, 'pose_data')

            if not os.path.isdir(data_dir):
                os.makedirs(data_dir)

            # with open(os.path.join(data_dir, 'wlm{}.pkl'.format(frame_start_end)), 'wb') as f:
            #     pickle.dump(pose_world_landmarks, f)

            np.save(os.path.join(data_dir, 'lm{}.npy'.format(
                frame_start_end)), pose_landmarks)
        else:
            with NamedTemporaryFile() as tf:
                # pickle.dump(pose_world_landmarks, tf)
                np.save(tf, pose_landmarks)

                self.oss_svc.simple_upload(
                    tf, self.oss_key + '/lm{}.npy'.format(frame_start_end))


if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser(
        prog='Save Video Pose',
        description='Extract face/pose/hand data from video',
        epilog='end===================')

    parser.add_argument(
        'filename', type=str, help="Path of a video file, could be an oss file key or local file path")
    parser.add_argument("-s", "--start", default="1", type=int, metavar="start time",
                        help="Start time when extract poses from video, in seconds")
    parser.add_argument("-e", "--end", default="-1", type=int, metavar="end time",
                        help="End time when extract poses from video, in seconds")

    args = parser.parse_args()

    os.environ["FLASK_DEBUG"] = "1"

    vp = VideoProcesser(args.filename, args.start, args.end)

    vp.save_video_poses()

    # redis_key = os.getenv('VIDEO_TO_PROCESS_REDIS_KEY',
    #                       default='video_to_process')

    # redis_client.rpush(
    #     redis_key, '8860f21aee324f9babf5bb1c771486c8/1665831900.1388848.mp4')

    # while True:

    #     if redis_client.llen(redis_key):

    #         try:

    #             vp = VideoProcesser(redis_client.lpop(
    #                 redis_key).decode('utf-8'))

    #             vp.save_video_poses()

    #         except Exception as e:

    #             logger.error("Video process error, {}".format(str(e)))

    #     else:
    #         pass

    #     time.sleep(1)
