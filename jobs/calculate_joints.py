import json
import os
import numpy as np
import matplotlib.pyplot as plt


def load_joints_pos(filename):

    with open(os.path.join('joints_pos', filename)) as f:
        data = [[v['x'], v['y'], v['z']]for v in json.load(f)]

    return data


def calculate_limb_vec(start_joints_pos, end_joints_pos):

    result = []

    for i in range(len(start_joints_pos)):
        result.append([end_joints_pos[i][0] - start_joints_pos[i][0], end_joints_pos[i]
                      [1] - start_joints_pos[i][1], end_joints_pos[i][2] - start_joints_pos[i][2]])

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

def plot_joints(data):

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

    plt.savefig('tmp/tmp.png')

if __name__ == "__main__":

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

    res = concatenate_limb_vec(
        leftupperarm, leftlowerarm, rightupperarm, rightlowerarm)

    print(res[99])
    print(res.shape)

    plot_joints(res)

    # print(leftupperarm[0])
    # print(rightupperarm.shape)
    # print(leftlowerarm.shape)
    # print(rightlowerarm.shape)

    # print(leftforearm_positions)
    # print(rightforearm_positions)
    # print(lefthand_positions)
    # print(righthand_positions)
