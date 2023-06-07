import json
import os
import numpy as np
import matplotlib.pyplot as plt
import math

from dtw import subsequenceDTW

NOSE = 0
LEFT_EYE_INNER = 1
LEFT_EYE = 2
LEFT_EYE_OUTER = 3
RIGHT_EYE_INNER = 4
RIGHT_EYE = 5
RIGHT_EYE_OUTER = 6
LEFT_EAR = 7
RIGHT_EAR = 8
MOUTH_LEFT = 9
MOUTH_RIGHT = 10
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
LEFT_ELBOW = 13
RIGHT_ELBOW = 14
LEFT_WRIST = 15
RIGHT_WRIST = 16
LEFT_PINKY = 17
RIGHT_PINKY = 18
LEFT_INDEX = 19
RIGHT_INDEX = 20
LEFT_THUMB = 21
RIGHT_THUMB = 22
LEFT_HIP = 23
RIGHT_HIP = 24
LEFT_KNEE = 25
RIGHT_KNEE = 26
LEFT_ANKLE = 27
RIGHT_ANKLE = 28
LEFT_HEEL = 29
RIGHT_HEEL = 30
LEFT_FOOT_INDEX = 31
RIGHT_FOOT_INDEX = 32


def normalize_vec(arr):

    vec = np.array(arr)
    mag = np.linalg.norm(vec)
    return vec / mag


def load_joints_pos(filename):

    with open(os.path.join('joints_pos', filename)) as f:
        data = [[v['x'], v['y'], v['z']]for v in json.load(f)]

    return data


def calculate_limb_vec(start_joints_pos, end_joints_pos):

    result = []

    for i in range(len(start_joints_pos)):
        result.append(normalize_vec([end_joints_pos[i][0] - start_joints_pos[i][0], end_joints_pos[i]
                      [1] - start_joints_pos[i][1], end_joints_pos[i][2] - start_joints_pos[i][2]]))

    return np.array(result)


def concatenate_limb_vec(leftupperarm, leftlowerarm, rightupperarm, rightlowerarm):

    leftupperarm = np.expand_dims(leftupperarm, axis=1)
    leftlowerarm = np.expand_dims(leftlowerarm, axis=1)

    rightupperarm = np.expand_dims(rightupperarm, axis=1)
    rightlowerarm = np.expand_dims(rightlowerarm, axis=1)

    res = np.concatenate(
        (leftupperarm, leftlowerarm, rightupperarm, rightlowerarm), axis=1)

    return res


def read_xyz(data):

    return data[:, :, 0].flatten(), data[:, :, 1].flatten(), data[:, :, 2].flatten()


def plot_joints(data, filename='tmp/tmp.png'):

    x, y, z = read_xyz(data)

    # print(x.shape)

    colors = np.array(range(data.shape[0]))
    colors = np.repeat(colors, 4)

    # print(colors.shape)

    fig = plt.figure(figsize=(20, 14))
    ax = fig.add_subplot(111, projection='3d')
    ax.scatter(x, y, z, c=colors)

    # Set the viewing angle to (90, 0) to rotate the axes to the top
    ax.view_init(elev=90, azim=-90)

    # labels = list(range(len(x)))

    # add labels to each point
    # for i in colors:
    #     ax.text(x[i], y[i], z[i], i)

    ax.set_xlabel("x")
    ax.set_ylabel("y")
    ax.set_zlabel("z")

    plt.savefig(filename)


def read_pose_slice(filename):

    with open(filename, 'r') as f:
        data_json = json.load(f)

    data = None
    ts = None

    for i in range(len(data_json)):

        tmp_data = None
        tmp_ts = None

        for dic in data_json[i]:

            arr = np.array([[[v['x'], v['y'], v['z']] for v in dic['data']]])

            if tmp_data is None:
                tmp_data = arr
            else:
                tmp_data = np.append(tmp_data, arr, axis=0)

            if tmp_ts is None:
                tmp_ts = np.array([dic['t']])
            else:
                tmp_ts = np.append(tmp_ts, np.array([dic['t']]), axis=0)

        tmp_data = np.expand_dims(tmp_data, axis=0)
        tmp_ts = np.expand_dims(tmp_ts, axis=0)

        if data is None:
            data = tmp_data
        else:
            data = np.append(data, tmp_data, axis=0)

        if ts is None:
            ts = tmp_ts
        else:
            ts = np.append(ts, tmp_ts, axis=0)

    return data, ts


def get_arm_pose_slice(pose_data):

    res = []

    for i in range(pose_data.shape[0]):

        res.append([])

        for j in range(pose_data.shape[1]):

            res[i].append([])

            res[i][j].append(normalize_vec([pose_data[i][j][LEFT_ELBOW][0] - pose_data[i][j][LEFT_SHOULDER][0],
                                            pose_data[i][j][LEFT_ELBOW][1] -
                                            pose_data[i][j][LEFT_SHOULDER][1],
                                            pose_data[i][j][LEFT_ELBOW][2] - pose_data[i][j][LEFT_SHOULDER][2]]))

            res[i][j].append(normalize_vec([pose_data[i][j][LEFT_WRIST][0] - pose_data[i][j][LEFT_ELBOW][0],
                                            pose_data[i][j][LEFT_WRIST][1] -
                                            pose_data[i][j][LEFT_ELBOW][1],
                                            pose_data[i][j][LEFT_WRIST][2] - pose_data[i][j][LEFT_ELBOW][2]]))

            res[i][j].append(normalize_vec([pose_data[i][j][RIGHT_ELBOW][0] - pose_data[i][j][RIGHT_SHOULDER][0],
                                            pose_data[i][j][RIGHT_ELBOW][1] -
                                            pose_data[i][j][RIGHT_SHOULDER][1],
                                            pose_data[i][j][RIGHT_ELBOW][2] - pose_data[i][j][RIGHT_SHOULDER][2]]))

            res[i][j].append(normalize_vec([pose_data[i][j][RIGHT_WRIST][0] - pose_data[i][j][RIGHT_ELBOW][0],
                                            pose_data[i][j][RIGHT_WRIST][1] -
                                            pose_data[i][j][RIGHT_ELBOW][1],
                                            pose_data[i][j][RIGHT_WRIST][2] - pose_data[i][j][RIGHT_ELBOW][2]]))

    res = np.array(res)

    return res


def points_diff(v1, v2):

    return math.sqrt((v1[0] - v2[0])**2 + (v1[1] - v2[1])**2 + (v1[2] - v2[2])**2)


def dtw_metric(a, b):
    return points_diff(a[0], b[0]) + points_diff(a[1], b[1]) + points_diff(a[2], b[2]) + points_diff(a[3], b[3])


if __name__ == "__main__":

    
    a = np.array([1,2,3,4,5,6,7,8,9,10,11])

    print(a[8:6])
    exit()

    leftarm_positions = load_joints_pos('1.json')
    rightarm_positions = load_joints_pos('2.json')
    leftforearm_positions = load_joints_pos('3.json')
    rightforearm_positions = load_joints_pos('4.json')
    lefthand_positions = load_joints_pos('5.json')
    righthand_positions = load_joints_pos('6.json')

    # print(leftarm_positions)
    # print(leftforearm_positions)

    leftupperarm = calculate_limb_vec(leftarm_positions, leftforearm_positions)
    rightupperarm = calculate_limb_vec(
        rightarm_positions, rightforearm_positions)

    leftlowerarm = calculate_limb_vec(
        leftforearm_positions, lefthand_positions)
    rightlowerarm = calculate_limb_vec(
        rightforearm_positions, righthand_positions)

    walking_cycle = concatenate_limb_vec(
        leftupperarm, leftlowerarm, rightupperarm, rightlowerarm)

    # print(res[99])
    print(walking_cycle.shape)

    # plot_joints(res[50:60], 'tmp/std.png')

    pose_data1, pose_ts1 = read_pose_slice(
        os.path.join('./pose_data', 'posedata1.json'))
    pose_data2, pose_ts2 = read_pose_slice(
        os.path.join('./pose_data', 'posedata2.json'))

    # print(pose_data1.shape)

    armslice = get_arm_pose_slice(pose_data2)

    print(armslice.shape)

    score = float('inf')
    is_walking = False
    start_idx = 0
    end_idx = 0

    for i in range(armslice.shape[0]):

        if not is_walking:
            # first time detect walking status
            dtw_res = subsequenceDTW(armslice[i], walking_cycle, metric=dtw_metric)

            score = dtw_res['accumulated_cost']

            if score < 50:
                is_walking = True

                start_idx = score['a*']
                end_idx = score['b*'] + 30

                if end_idx > len(walking_cycle):
                    end_idx = len(walking_cycle) - end_idx

        else:
            # already in walking status, detect if walking is continuing

            dtw_res = subsequenceDTW(armslice[i], walking_cycle[start_idx: end_idx], metric=dtw_metric)

            score = dtw_res['accumulated_cost']

            if score < 50:
                start_idx = start_idx + score['a*']
                end_idx = start_idx + score['b*'] + 30

                if end_idx > len(walking_cycle):
                    end_idx = len(walking_cycle) - end_idx
            else:
                is_walking = False


        print("{}, {}, {}".format(dtw_res['accumulated_cost'], score['a*'], score['b*']))

        # break

    # plot_joints(armslice[50][:10])

    # print(leftupperarm[0])
    # print(rightupperarm.shape)
    # print(leftlowerarm.shape)
    # print(rightlowerarm.shape)

    # print(leftforearm_positions)
    # print(rightforearm_positions)
    # print(lefthand_positions)
    # print(righthand_positions)


