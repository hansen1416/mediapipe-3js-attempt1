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

from ropes import logger, redis_client
from oss_service import OSSService

# MEDIA_DIR = os.path.join('.', 'media')
# POSE_DATA_DIR = os.path.join('.', 'pose_data')

# mp_drawing = mp.solutions.drawing_utils
# mp_drawing_styles = mp.solutions.drawing_styles
mp_pose: pose = mp.solutions.pose

# from gist https://gist.github.com/WetHat/1d6cd0f7309535311a539b42cccca89c


class Annotation3D(Annotation):

    def __init__(self, text, xyz, *args, **kwargs):
        super().__init__(text, xy=(0, 0), *args, **kwargs)
        self._xyz = xyz

    def draw(self, renderer):
        x2, y2, z2 = proj_transform(*self._xyz, self.axes.M)
        self.xy = (x2, y2)
        super().draw(renderer)

# For seamless integration we add the annotate3D method to the Axes3D class.


def _annotate3D(ax, text, xyz, *args, **kwargs):
    '''Add anotation `text` to an `Axes3d` instance.'''

    annotation = Annotation3D(text, xyz, *args, **kwargs)
    ax.add_artist(annotation)


setattr(Axes3D, 'annotate3D', _annotate3D)


class Arrow3D(FancyArrowPatch):

    def __init__(self, x, y, z, dx, dy, dz, *args, **kwargs):
        super().__init__((0, 0), (0, 0), *args, **kwargs)
        self._xyz = (x, y, z)
        self._dxdydz = (dx, dy, dz)

    def draw(self, renderer):
        x1, y1, z1 = self._xyz
        dx, dy, dz = self._dxdydz
        x2, y2, z2 = (x1 + dx, y1 + dy, z1 + dz)

        xs, ys, zs = proj_transform((x1, x2), (y1, y2), (z1, z2), self.axes.M)
        self.set_positions((xs[0], ys[0]), (xs[1], ys[1]))
        super().draw(renderer)

    def do_3d_projection(self):
        x1, y1, z1 = self._xyz
        dx, dy, dz = self._dxdydz
        x2, y2, z2 = (x1 + dx, y1 + dy, z1 + dz)

        xs, ys, zs = proj_transform((x1, x2), (y1, y2), (z1, z2), self.axes.M)
        self.set_positions((xs[0], ys[0]), (xs[1], ys[1]))

        return np.min(zs)

# For seamless integration we add the arrow3D method to the Axes3D class.


def _arrow3D(ax, x, y, z, dx, dy, dz, *args, **kwargs):
    '''Add an 3d arrow to an `Axes3D` instance.'''

    arrow = Arrow3D(x, y, z, dx, dy, dz, *args, **kwargs)
    ax.add_artist(arrow)


setattr(Axes3D, 'arrow3D', _arrow3D)


Extremities = namedtuple('Extremities', ['LEFT_FOREARM', 'LEFT_UPPERARM', 'RIGHT_FOREARM', 'RIGHT_UPPERARM',
                                         'LEFT_THIGH', 'LEFT_SHANK', 'RIGHT_THIGH', 'RIGHT_SHANK'])


class VideoProcesser():

    def __init__(self, oss_key) -> None:

        self.oss_key = oss_key
        self.oss_svc = OSSService()

        if os.getenv('FLASK_DEBUG'):
            self.video_path = "/tmp/tmppesudo"
        else:
            self.video_path = self.oss_svc.remote_to_stream(oss_key)

        logger.info("tmp file {}".format(self.video_path))

        self.cap = cv2.VideoCapture(self.video_path)

        total_frames = self.cap.get(cv2.CAP_PROP_FRAME_COUNT)

        fps = self.cap.get(cv2.CAP_PROP_FPS)

        logger.info('video filename {}, frames {}, fps {}'.format(
            self.video_path, total_frames, fps))

        self.joints = ['NOSE',
                       'LEFT_EYE_INNER',
                       'LEFT_EYE',
                       'LEFT_EYE_OUTER',
                       'RIGHT_EYE_INNER',
                       'RIGHT_EYE',
                       'RIGHT_EYE_OUTER',
                       'LEFT_EAR',
                       'RIGHT_EAR',
                       'MOUTH_LEFT',
                       'MOUTH_RIGHT',
                       'LEFT_SHOULDER',
                       'RIGHT_SHOULDER',
                       'LEFT_ELBOW',
                       'RIGHT_ELBOW',
                       'LEFT_WRIST',
                       'RIGHT_WRIST',
                       'LEFT_PINKY',
                       'RIGHT_PINKY',
                       'LEFT_INDEX',
                       'RIGHT_INDEX',
                       'LEFT_THUMB',
                       'RIGHT_THUMB',
                       'LEFT_HIP',
                       'RIGHT_HIP',
                       'LEFT_KNEE',
                       'RIGHT_KNEE',
                       'LEFT_ANKLE',
                       'RIGHT_ANKLE',
                       'LEFT_HEEL',
                       'RIGHT_HEEL',
                       'LEFT_FOOT_INDEX',
                       'RIGHT_FOOT_INDEX', ]

        self.limbs = {
            'LEFT_SHOULDER': 'LEFT_ELBOW',
            'LEFT_ELBOW': 'LEFT_WRIST',
            'RIGHT_ELBOW': 'RIGHT_WRIST',
            'RIGHT_SHOULDER': 'RIGHT_ELBOW',
            'LEFT_HIP': 'LEFT_KNEE',
            'LEFT_KNEE': 'LEFT_ANKLE',
            'RIGHT_HIP': 'RIGHT_KNEE',
            'RIGHT_KNEE': 'RIGHT_ANKLE'
        }

    def __del__(self):

        self.cap.release()

        # this was a tmp file
        os.unlink(self.video_path)

        logger.info("Release video")

    def read_points_from_landmarks(self, landmarks):

        data = []

        for j in self.joints:

            data.append([landmarks[PoseLandmark[j]].x,
                        landmarks[PoseLandmark[j]].y, landmarks[PoseLandmark[j]].z])

        return data

    def save_video_poses(self):

        count = 1

        pose_world_landmarks = []

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

                        pose_world_landmarks.append([])

                    else:

                        pose_world_landmarks.append(
                            self.read_points_from_landmarks(results.pose_world_landmarks.landmark))

                    if count and (count % 3000) == 0:
                        frame_start_end = str(count-3000) + '-' + str(count)

                        with NamedTemporaryFile() as tf:
                            np.save(tf, pose_world_landmarks)

                            self.oss_svc.simple_upload(
                                tf, self.oss_key + '/wlm{}.npy'.format(frame_start_end))

                        pose_world_landmarks = []

                        logger.info(
                            "Save pose world landmark for {}".format(frame_start_end))

                    count += 1

                    if count % 100 == 0:
                        logger.info(count)

                else:
                    # when video finished

                    # set to video start
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

                    if len(pose_world_landmarks):

                        frame_start_end = str(
                            count - count % 3000) + '-' + str(count)

                        with NamedTemporaryFile() as tf:
                            np.save(tf, pose_world_landmarks)

                            self.oss_svc.simple_upload(
                                tf, self.oss_key + '/wlm{}.npy'.format(frame_start_end))

                        pose_world_landmarks

                        logger.info(
                            "Save pose world landmark masks for {}".format(frame_start_end))


if __name__ == "__main__":

    redis_key = os.getenv('VIDEO_TO_PROCESS_REDIS_KEY',
                          default='video_to_process')

    redis_client.rpush(
        redis_key, '8860f21aee324f9babf5bb1c771486c8/1665829847.0999663.mp4')

    while True:

        if redis_client.llen(redis_key):

            try:

                vp = VideoProcesser(redis_client.lpop(
                    redis_key).decode('utf-8'))

                vp.save_video_poses()

            except Exception as e:

                logger.error("Video process error, {}".format(str(e)))

        else:
            pass

        time.sleep(1)
