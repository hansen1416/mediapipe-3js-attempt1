import json
import os

import numpy as np
from mediapipe.python.solutions.pose import PoseLandmark

from plot_pose import PosePlot

animation_dir = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'animations')


def analyse_motion(data):
    # print(data.keys()) # dict_keys(['name', 'duration', 'tracks', 'uuid', 'blendMode'])
    print(data['name'])
    # print(len(data['tracks']))

    for i in data['tracks']:

        if i['type'] != 'quaternion':
            continue

        print(i['name'])

        print(len(i['Vectors']))

        # break

def normal_vector(v):
    return v / np.sqrt(np.sum(v**2))

def mid_point(a, b, normal=True):
    v = np.array([(a[i] + b[i]) / 2 for i in range(len(a))])
    if normal:
        return normal_vector(v)
    return v

def minus_point(a, b, normal=True):
    v = np.array([b[i] - a[i] for i in range(len(a))])
    if normal:
        return normal_vector(v)
    return v

def find_basis_from_pose(pose_data_one_frame):

    left_hip = pose_data_one_frame[PoseLandmark['LEFT_HIP'].value]
    right_hip = pose_data_one_frame[PoseLandmark['RIGHT_HIP'].value]
    left_shoulder = pose_data_one_frame[PoseLandmark['LEFT_SHOULDER'].value]
    right_shoulder = pose_data_one_frame[PoseLandmark['RIGHT_SHOULDER'].value]

    mid_hip = mid_point(left_hip, right_hip)
    mid_shoulder = mid_point(left_shoulder, right_shoulder)

    x_basis = minus_point(right_hip, mid_hip)
    y_basis = minus_point(mid_hip, mid_shoulder)

    z_basis = np.cross(x_basis, y_basis)

    return x_basis, y_basis, z_basis




if __name__ == "__main__":

    pose_results = np.load(os.path.join('tmp', 'wlm1500-1600.npy'), allow_pickle=True)
    frame_n = 0

    find_basis_from_pose(pose_results[frame_n])

    pp = PosePlot()

    pp.plot_world_pose(pose_results[frame_n], 'pose11.png')

    exit()


    for name in os.listdir(animation_dir):

        with open(os.path.join(animation_dir, name), 'r') as f:

            data = json.load(f)

            analyse_motion(data)

        break

    # anim = json.load()
