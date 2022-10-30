import math
import os
import re
import sys
import tempfile
import time
import struct

# import cv2
import matplotlib.pyplot as plt
import mediapipe as mp
# import imageio.v3 as iio
import numpy as np

from mediapipe.python.solutions.pose import PoseLandmark
from scipy.optimize import curve_fit

from ropes import logger
import threed_utils


class PosePlot():

    def __init__(self) -> None:
        # self.cap = cv2.VideoCapture(video_path)

        # self.filename = os.path.split(video_path)[-1]

        # total_frames = self.cap.get(cv2.CAP_PROP_FRAME_COUNT)

        # fps = self.cap.get(cv2.CAP_PROP_FPS)

        # logger.info('video filename {}, frames {}, fps {}'.format(self.filename, total_frames, fps))

        # self.frames_steps = 1

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

        self.joints_connect = [
            ["LEFT_SHOULDER", "RIGHT_SHOULDER"],
            ["LEFT_SHOULDER", "LEFT_ELBOW"],
            ["LEFT_ELBOW", "LEFT_WRIST"],
            ["RIGHT_SHOULDER", "RIGHT_ELBOW"],
            ["RIGHT_ELBOW", "RIGHT_WRIST"],
            ["LEFT_SHOULDER", "LEFT_HIP"],
            ["RIGHT_SHOULDER", "RIGHT_HIP"],
            ["LEFT_HIP", "LEFT_KNEE"],
            ["LEFT_KNEE", "LEFT_ANKLE"],
            ["RIGHT_HIP", "RIGHT_KNEE"],
            ["RIGHT_KNEE", "RIGHT_ANKLE"],
        ]

        # self.cache_expire_at = 3600 * 6

        # self.redis_db = redis.Redis(host="localhost", port="6379", charset="utf-8")

    @staticmethod
    def landmark_to_point(landmark):
        return [landmark[0], landmark[1], landmark[2]]

    def read_points_from_landmarks(self, landmarks):

        xdata = []
        ydata = []
        zdata = []

        for j in self.joints:

            xdata.append(landmarks[PoseLandmark[j]][0])
            ydata.append(landmarks[PoseLandmark[j]][1])
            zdata.append(landmarks[PoseLandmark[j]][2])

        return xdata, ydata, zdata

    def read_annotations_from_landmarks(self, landmarks):
        annotations = []

        for j in self.joints:
            annotations.append(
                [j, self.landmark_to_point(landmarks[PoseLandmark[j]])])

        return annotations

    def read_arrows_from_landmarks(self, landmarks):

        arrows = []

        for k, v in self.joints_connect:

            x, y, z = self.landmark_to_point(
                landmarks[PoseLandmark[k]])
            u, v, w = self.landmark_to_point(
                landmarks[PoseLandmark[v]])

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

        # ax.invert_xaxis()

        ax.set_xlabel('x')
        ax.set_ylabel('y')
        ax.set_zlabel('z')

        ax.view_init(elev=90, azim=90)

        plt.savefig(filename)


def curve_func_2d(x, a, b):

    return a*(x**3) + b


def curve_func_3d(x, a, b, c):

    return a*(x[0]**3) + b*(x[1]**3) + c


def fit_motion_curve(pose_timeseries, joint_name, filename='tmp-pose-motion.png'):

    pose_timeseries = np.array(list(map(np.array, pose_timeseries)))

    xdata = pose_timeseries[:, PoseLandmark[joint_name], 0]
    ydata = pose_timeseries[:, PoseLandmark[joint_name], 1]
    zdata = pose_timeseries[:, PoseLandmark[joint_name], 2]

    # xydata = np.transpose((xdata, ydata))

    # logger.info(xydata.shape)
    # logger.info(zdata.shape)

    param2d, _ = curve_fit(curve_func_2d, xdata, ydata)

    xline = xdata
    yline = curve_func_2d(xdata, *param2d)

    param3d, _ = curve_fit(curve_func_3d, [xline, yline], zdata)

    zline = curve_func_3d([xline, yline], *param3d)

    return xline, yline, zline


def draw_motion(pose_timeseries, joint_name, filename='tmp-pose-motion.png'):

    ax = plt.axes(projection='3d')

    pose_timeseries = np.array(list(map(np.array, pose_timeseries)))

    # Data for three-dimensional scattered points
    xdata = pose_timeseries[:, PoseLandmark[joint_name], 0]
    ydata = pose_timeseries[:, PoseLandmark[joint_name], 1]
    zdata = pose_timeseries[:, PoseLandmark[joint_name], 2]

    ax.scatter3D(xdata, ydata, zdata, c=zdata)  # , cmap='Greens')

    xline, yline, zline = fit_motion_curve(pose_timeseries, joint_name)

    ax.plot3D(xline, yline, zline, 'gray')

    ax.set_xlabel('x')
    ax.set_ylabel('y')
    ax.set_zlabel('z')

    ax.view_init(elev=20, azim=45)

    plt.savefig(filename)


if __name__ == "__main__":

    pose_results = np.load(os.path.join(
        'tmp', 'wlm0-3000.npy'), allow_pickle=True)

    pose_results = np.array(list(map(np.array, pose_results)))

    logger.info(pose_results.shape)

    # fit_motion_curve(pose_results[800:900], joint='LEFT_ELBOW', filename=os.path.join(
    #     'tmp', 'left_elbow_fit.png'))

    # for i in PoseLandmark:
    #     draw_motion(pose_results[800:900], i.name,
    #                 os.path.join('tmp', i.name + '.png'))

    # logger.info(PoseLandmark)

    # draw_motion(pose_results[800:900], 'LEFT_ELBOW',
    #             os.path.join('tmp', 'left_elbow.png'))

    # pp = PosePlot()

    # for i, p in enumerate(pose_results[800:900]):

    #     # pp.plot_world_pose(p, os.path.join('tmp', 'pose_{}.png'.format(i)))

    #     break
