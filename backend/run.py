from genericpath import isfile
import math
import os
import re
import sys
import tempfile
import time
import struct

import redis
from collections import namedtuple
import cv2
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

from logger import logger

MEDIA_DIR = os.path.join('.', 'media')
POSE_DATA_DIR = os.path.join('.', 'pose_data')

mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
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


Extremities = namedtuple('Extremities', ['LEFT_FOREARM', 'LEFT_UPPERARM', 'RIGHT_FOREARM', 'RIGHT_UPPERARM',
                                         'LEFT_THIGH', 'LEFT_SHANK', 'RIGHT_THIGH', 'RIGHT_SHANK'])


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

        self.filename = os.path.split(video_path)[-1]
        
        total_frames = self.cap.get(cv2.CAP_PROP_FRAME_COUNT)
        
        fps = self.cap.get(cv2.CAP_PROP_FPS)
        
        logger.info('video filename {}, frames {}, fps {}'.format(self.filename, total_frames, fps))

        self.frames_steps = 1

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

        self.redis_db = redis.Redis(host="localhost", port="6379")

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
                        pose_landmarks.append(
                            pickle.dumps(results.pose_landmarks))
                        pose_world_landmarks.append(
                            pickle.dumps(results.pose_world_landmarks))
                        segment_masks.append(
                            np.zeros(frame.shape, dtype=np.uint8))

                    if count and (count % 3000) == 0:
                        frame_start_end = str(count-3000) + '-' + str(count)

                        np.save(os.path.join(POSE_DATA_DIR, 'lm{}.npy'.format(
                            frame_start_end)), pose_landmarks)
                        np.save(os.path.join(POSE_DATA_DIR, 'wlm{}.npy'.format(
                            frame_start_end)), pose_world_landmarks)
                        np.save(os.path.join(POSE_DATA_DIR, 'sm{}.npy'.format(
                            frame_start_end)), segment_masks)

                        logger.info(
                            "Save pose landmark and segmentation masks for {}".format(frame_start_end))

                        pose_landmarks = []
                        pose_world_landmarks = []
                        segment_masks = []

                    count += 1

                else:
                    # set to video start
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

                    if len(pose_landmarks):
                        frame_start_end = str(
                            count - count % 3000) + '-' + str(count)

                        np.save(os.path.join(POSE_DATA_DIR, 'lm{}.npy'.format(
                            frame_start_end)), pose_landmarks)
                        np.save(os.path.join(POSE_DATA_DIR, 'wlm{}.npy'.format(
                            frame_start_end)), pose_world_landmarks)
                        np.save(os.path.join(POSE_DATA_DIR, 'sm{}.npy'.format(
                            frame_start_end)), segment_masks)

                        logger.info(
                            "Save pose landmark and segmentation masks for {}".format(frame_start_end))

                    break


    def display_pose_for_frame(self, video_frame, pose_landmark, segmentation_mask=None):

        # Draw pose landmarks on the image.
        mp_drawing.draw_landmarks(
            video_frame,
            pose_landmark,
            mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())

        cv2.imwrite(
            './tmp/frame_pose{}.png'.format(int(time.time())), video_frame)

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
        pass

    @staticmethod
    def landmark_to_point(landmark):
        return [landmark.x, landmark.y, landmark.z]

    def read_points_from_landmarks(self, landmarks):

        xdata = []
        ydata = []
        zdata = []

        for j in self.joints:

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

    def plot_video_world_poses(self):
        pose_results_npy = os.path.join(POSE_DATA_DIR, 'wlm0-3000.npy')

        pose_data = np.load(pose_results_npy)

        for i in range(pose_data.shape[0]):

            pose_lm = pickle.loads(pose_data[i])

            self.plot_world_pose(pose_lm.landmark)

            break

    def plot_video_viewport_poses(self):

        pose_results_npy = os.path.join(POSE_DATA_DIR, 'lm0-3000.npy')

        pose_data = np.load(pose_results_npy)

        for i in range(pose_data.shape[0]):

            pose_lm = pickle.loads(pose_data[i])

            self.plot_viewport_pose(pose_lm.landmark)

            break

    def plot_pose_for_frame(self, frame_index):

        self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index*self.frames_steps)

        ret, video_frame = self.cap.read()

        if not ret:
            logger.info("Read video frame false frame{}".format(
                frame_index*self.frames_steps))
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            return

        with mp_pose.Pose(static_image_mode=False,
                          model_complexity=2,
                          enable_segmentation=True,
                          min_detection_confidence=0.5) as pose:

            results = pose.process(cv2.cvtColor(
                video_frame, cv2.COLOR_BGR2RGB))

            cv2.imwrite('./tmp/frame_{}.png'.format(frame_index), video_frame)

            self.plot_world_pose(results.pose_world_landmarks.landmark, os.path.join(
                'tmp', 'pose-world-{}.png'.format(frame_index)))
            self.plot_viewport_pose(results.pose_landmarks.landmark, os.path.join(
                'tmp', 'pose-viewport-{}.png'.format(frame_index)))

    def frame_find_result_file(self, frame_index):

        frame_index = frame_index*self.frames_steps

        residual = frame_index % 3000

        suffix = str(frame_index - residual) + '-' + \
            str(frame_index + (3000 - residual))

        lmfile = os.path.join(POSE_DATA_DIR, 'lm' + suffix + '.npy')
        wlmfile = os.path.join(POSE_DATA_DIR, 'wlm' + suffix + '.npy')

        if not os.path.isfile(lmfile) or not os.path.isfile(wlmfile):
            return None, None

        lm_interval = np.load(lmfile, allow_pickle=True)
        wlm_interval = np.load(wlmfile, allow_pickle=True)

        pose_lm = pickle.loads(lm_interval[residual])
        pose_wlm = pickle.loads(wlm_interval[residual])

        return pose_wlm, pose_lm

    def plot_pose_for_result(self, frame_index):

        pose_wlm, pose_lm = self.frame_find_result_file(frame_index)

        self.plot_world_pose(pose_lm.landmark, os.path.join(
            'tmp', 'pose-res-world-{}.png'.format(frame_index)))
        self.plot_viewport_pose(pose_wlm.landmark, os.path.join(
            'tmp', 'pose-res-viewport-{}.png'.format(frame_index)))

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

        plotting_range = (0, 1)

        ax.set_xlim(plotting_range)
        ax.set_ylim(plotting_range)
        ax.set_zlim(plotting_range)

        ax.invert_xaxis()

        ax.set_xlabel('x')
        ax.set_ylabel('y')
        ax.set_zlabel('z')

        ax.view_init(elev=90, azim=90)

        plt.savefig(filename)

    def plot_viewport_pose(self, pose_world_landmark, filename='tmp-viewport.png'):

        xdata, ydata, zdata = self.read_points_from_landmarks(
            pose_world_landmark)
        annotations = self.read_annotations_from_landmarks(pose_world_landmark)
        arrows = self.read_arrows_from_landmarks(pose_world_landmark)

        fig = plt.figure(figsize=(10, 10))
        fig.tight_layout()
        ax = fig.add_subplot(111, projection='3d')

        ax.scatter(xdata, ydata, zdata)

        for anno in annotations:
            ax.annotate3D(anno[0], tuple(*anno[1:]),
                          xytext=(3, 3), textcoords='offset points')

        for arro in arrows:
            ax.arrow3D(*arro)

        ax.invert_xaxis()

        ax.set_xlabel('x')
        ax.set_ylabel('y')
        ax.set_zlabel('z')

        ax.view_init(elev=90, azim=90)

        plt.savefig(filename)

    def find_angle_between_vectors(self, vec1, vec2):

        dot = vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2]
        mag = ((vec1[0] ** 2 + vec1[1] ** 2 + vec1[2] ** 2) ** 0.5) * \
            ((vec2[0] ** 2 + vec2[1] ** 2 + vec2[2] ** 2) ** 0.5)

        return np.arccos(dot/mag)

    def compare_poses(self, frame1, frame2):

        wlm1, lm1 = self.frame_find_result_file(frame1)
        wlm2, lm2 = self.frame_find_result_file(frame2)

        logger.info(
            "============== Viewport landmark, frame {} vs {}".format(frame1, frame2))
        self.plot_degrees(lm1.landmark, lm2.landmark)
        logger.info(
            "============== World landmark, frame {} vs {}".format(frame1, frame2))
        self.plot_degrees(wlm1.landmark, wlm2.landmark)

    def plot_degrees(self, landmark1, landmark2):

        arrows1 = self.read_arrows_from_landmarks(landmark1)
        arrows2 = self.read_arrows_from_landmarks(landmark2)

        extr1 = Extremities(*arrows1)
        extr2 = Extremities(*arrows2)

        # logger.info(extr1)
        # logger.info(extr2)

        for f in Extremities._fields:
            l1 = list(getattr(extr1, f))[3:]
            l2 = list(getattr(extr2, f))[3:]

            radius = self.find_angle_between_vectors(l1, l2)

            logger.info("{} shifted degrees {}, radius {}".format(
                f, math.degrees(radius), radius))


    def video_pose_to_redis(self, world_landmark=True):

        pose_type = 'wlm' if world_landmark else 'lm'
        
        for p in os.listdir(POSE_DATA_DIR):

            if p.startswith(self.filename + '_' + pose_type):

                start_frame = int(re.search(re.compile("(\d+)\-\d+\.npy$"), p).group(1))
                
                pipes = self.redis_db.pipeline()

                data = np.load(os.path.join(POSE_DATA_DIR, p), allow_pickle=True)

                for i in range(data.shape[0]):

                    lm = pickle.loads(data[i])

                    if not lm:
                        continue

                    frame_index = start_frame + i

                    poselm = np.array([[wlm.x, wlm.y, wlm.z, wlm.visibility] \
                        for wlm in lm.landmark])

                    pose1d = poselm.reshape(-1).tolist()

                    bstr = None

                    for pf in pose1d:

                        if bstr is None:
                            bstr = struct.pack('<f', pf)
                        else:
                            bstr += struct.pack('<f', pf) #+ struct.pack('f', pose1d[1])

                    # logger.info(frame_index)
                    pipes.setex(self.filename + ':' + str(frame_index), 3600, bstr)

                pipes.execute()


if __name__ == "__main__":

    video_file = os.path.join(MEDIA_DIR, '6packs.mp4')

    processer = PreprocessVideo(video_file)

    # processer.save_video_poses()

    # processer.plot_video_world_poses()

    # processer.plot_pose_for_frame(frame_index=10020)

    # processer.plot_pose_for_result(frame_index=10000)

    # processer.compare_poses(frame1=10000, frame2=10020)

    # processer.video_pose_to_redis()




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
