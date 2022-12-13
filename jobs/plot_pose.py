import math
import os
import re
import sys
import tempfile
import time
import struct

import redis
from collections import namedtuple
# import cv2
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.proj3d import proj_transform
from mpl_toolkits.mplot3d.axes3d import Axes3D
from matplotlib.patches import FancyArrowPatch
from matplotlib.text import Annotation
import mediapipe as mp
# import imageio.v3 as iio
import numpy as np
from PIL import Image
import pickle
from mediapipe.python.solutions import pose
from mediapipe.python.solutions.pose import PoseLandmark
# from mediapipe.framework.formats.landmark_pb2 import NormalizedLandmark
# from mediapipe.framework.formats.landmark_pb2 import LandmarkList
# from google.protobuf.pyext._message import RepeatedCompositeContainer

from ropes import logger

mp_pose: pose = mp.solutions.pose


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

    def do_3d_projection(self, renderer=None):
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


class PosePlot():

    def __init__(self, isarray=True) -> None:
        # self.cap = cv2.VideoCapture(video_path)

        # self.filename = os.path.split(video_path)[-1]

        # total_frames = self.cap.get(cv2.CAP_PROP_FRAME_COUNT)

        # fps = self.cap.get(cv2.CAP_PROP_FPS)

        # logger.info('video filename {}, frames {}, fps {}'.format(self.filename, total_frames, fps))

        # self.frames_steps = 1

        self.isarray = isarray

        self.joints = ['LEFT_WRIST',
                       'LEFT_ELBOW',
                       'LEFT_SHOULDER',
                       'RIGHT_WRIST',
                       'RIGHT_ELBOW',
                       'RIGHT_SHOULDER',
                       'LEFT_HIP',
                       'LEFT_KNEE',
                       'LEFT_ANKLE',
                       'RIGHT_HIP',
                       'RIGHT_KNEE',
                       'RIGHT_ANKLE']

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

        # self.cache_expire_at = 3600 * 6

        # self.redis_db = redis.Redis(host="localhost", port="6379", charset="utf-8")


    def landmark_to_point(self, landmark):
        if self.isarray:
            return [landmark[0], landmark[1], landmark[2]]
        else:
            return [landmark.x, landmark.y, landmark.z]

    def read_points_from_landmarks(self, landmarks):

        xdata = []
        ydata = []
        zdata = []

        for j in self.joints:
            if self.isarray:
                xdata.append(landmarks[PoseLandmark[j]][0])
                ydata.append(landmarks[PoseLandmark[j]][1])
                zdata.append(landmarks[PoseLandmark[j]][2])
            else:
                xdata.append(landmarks[PoseLandmark[j]].x)
                ydata.append(landmarks[PoseLandmark[j]].y)
                zdata.append(landmarks[PoseLandmark[j]].z)

        return xdata, ydata, zdata

    def read_annotations_from_landmarks(self, landmarks):
        annotations = []

        for j in self.joints:
            annotations.append(
                [j, self.landmark_to_point(landmarks[PoseLandmark[j]])])

        return annotations

    def read_arrows_from_landmarks(self, landmarks):

        arrows = []

        for k, v in self.limbs.items():
            x, y, z = self.landmark_to_point(
                landmarks[mp_pose.PoseLandmark[k]])
            u, v, w = self.landmark_to_point(
                landmarks[mp_pose.PoseLandmark[v]])

            arrows.append((x, y, z, u-x, v-y, w-z))

        return arrows

    def plot_world_pose(self, pose_landmark, filename='tmp-world.png'):

        xdata, ydata, zdata = self.read_points_from_landmarks(pose_landmark)
        annotations = self.read_annotations_from_landmarks(pose_landmark)
        arrows = self.read_arrows_from_landmarks(pose_landmark)

        fig = plt.figure(figsize=(10, 10))
        fig.tight_layout()
        ax = fig.add_subplot(111, projection='3d')

        ax.scatter(xdata, ydata, zdata)

        for anno in annotations:
            ax.annotate3D(anno[0], tuple(*anno[1:]),
                          xytext=(3, 3), textcoords='offset points')

        for arro in arrows:
            ax.arrow3D(*arro)

        plotting_range = (-1, 1)

        ax.set_xlim(plotting_range)
        ax.set_ylim(plotting_range)
        ax.set_zlim(plotting_range)

        ax.invert_xaxis()

        ax.set_xlabel('x')
        ax.set_ylabel('y')
        ax.set_zlabel('z')

        ax.view_init(elev=90, azim=90)

        plt.savefig(filename)


if __name__ == "__main__":

    pose_result_file = os.path.join('tmp', '6packs.mp4_wlm0-3000.npy')

    pose_results = np.load(pose_result_file, allow_pickle=True)

    arr = np.linspace(0, len(pose_results), 100, endpoint=False, dtype=int)

    for i in arr:

        frame_pose_landmark: PoseLandmark = pickle.loads(pose_results[i])

        print(frame_pose_landmark)

        break

        # logger.info(frame_pose_landmark)

        pp = PosePlot()

        pp.plot_world_pose(frame_pose_landmark.landmark, os.path.join(
            'imgs', '6packs.mp4_wlm' + str(i) + '.png'))
