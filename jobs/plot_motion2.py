import array
import json
import os
import numpy as np
import matplotlib.pyplot as plt


def read_xyz(data):

    return data[:, 0], data[:, 1], data[:, 2]


def plot_joints(data):

    x, y, z = read_xyz(data)

    fig = plt.figure(figsize=(20, 14))
    ax = fig.add_subplot(111, projection='3d')
    ax.scatter(x, y, z)

    # Set the viewing angle to (90, 0) to rotate the axes to the top
    ax.view_init(elev=90, azim=-90)

    labels = list(range(len(x)))

    # add labels to each point
    for i, txt in enumerate(labels):
        ax.text(x[i], y[i], z[i], txt)

    ax.set_xlabel("x")
    ax.set_ylabel("y")
    ax.set_zlabel("z")

    plt.savefig('tmp/tmp.png')


def read_motion(filename):

    with open(filename, 'rb') as f:

        bytes = f.read()

        arr = array.array('f')
        arr.frombytes(bytes)

    arr = np.array(arr)
    arr = arr.reshape((-1, 22, 3))

    return arr


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


if __name__ == "__main__":

    seed = [1, 2, 3, 4]
    samp = [0, 1, 2]

    motion_data = []

    for se in seed:
        for sa in samp:
            filename = os.path.join(
                './motion', 'motion' + str(se) + '-' + str(sa) + '.bin')

            motion_data.append(read_motion(filename))

    motion_data = np.array(motion_data)

    # print(motion_data.shape) # (12, 120, 22, 3), there are 12 motion data

    # plot_joints(motion_data[8][100])

    # posedata1.json length 442
    # posedata2.json length 516
    pose_data1, pose_ts1 = read_pose_slice(
        os.path.join('./pose_data', 'posedata1.json'))
    pose_data2, pose_ts2 = read_pose_slice(
        os.path.join('./pose_data', 'posedata2.json'))

    # print(pose_data1.shape) # (442, 29, 33, 3)
    # print(pose_ts1.shape) # (442, 29)

    # print(pose_data2.shape) # (516, 29, 33, 3)
    # print(pose_ts2.shape) # (516, 29)

    # plot_joints(pose_data2[100][20])
