import json
import os

import numpy as np
import matplotlib.pyplot as plt

body25_names = [
    "NOSE",
    "LEYE",
    "REYE",
    "LEAR",
    "REAR",
    "LSHOULDER",
    "RSHOULDER",
    "LELBOW",
    "RELBOW",
    "LWRIST",
    "RWRIST",
    "LHIP",
    "RHIP",
    "LKNEE",
    "RKNEE",
    "LANKLE",
    "RANKLE",
    "UPPERNECK",
    "HEADTOP",
    "LBIGTOE",
    "LSMALLTOE",
    "LHEEL",
    "RBIGTOE",
    "RSMALLTOE",
    "RHEEL",
]

body21a_names = [
    "NOSE",
    "NECK",
    "RSHOULDER",
    "RELBOW",
    "RWRIST",
    "LSHOULDER",
    "LELBOW",
    "LWRIST",
    "LOWERABS",
    "RHIP",
    "RKNEE",
    "RANKLE",
    "LHIP",
    "LKNEE",
    "LANKLE",
    "REYE",
    "LEYE",
    "REAR",
    "LEAR",
    "REALNECK",
    "TOP",
]


def load_keypoints(file):

    with open(file) as f:
        data = json.load(f)

    return data['people'][0]['pose_keypoints_2d']


def decompose_keypoints(pose_keypoints_2d):

    x = []
    y = []
    c = []

    for i in range(0, len(pose_keypoints_2d)):
        if i % 3 == 0:
            x.append(pose_keypoints_2d[i])
        if i % 3 == 1:
            y.append(pose_keypoints_2d[i])
        if i % 3 == 2:
            c.append(pose_keypoints_2d[i])

    return x, y, c


def body_25b_to_21a(body25b_keypoints):

    x, y, c = decompose_keypoints(body25b_keypoints)

    mask = [0, 'NECK', 6, 8, 10, 5, 7, 9, 'LOWERABS',
            12, 14, 16, 11, 13, 15, 2, 1, 4, 3, 17, 18]

    res = []

    for m in mask:

        if type(m) == int:
            res.append(x[m])
            res.append(y[m])
            res.append(c[m])
        else:
            if m == 'NECK':
                neck_x = (x[body25_names.index('LSHOULDER')] +
                          x[body25_names.index('RSHOULDER')]) / 2

                neck_y = (y[body25_names.index('LSHOULDER')] +
                          y[body25_names.index('RSHOULDER')]) / 2

                neck_c = (c[body25_names.index('LSHOULDER')] +
                          c[body25_names.index('RSHOULDER')]) / 2

                res.append(neck_x)
                res.append(neck_y)
                res.append(neck_c)

            if m == 'LOWERABS':
                abs_x = (x[body25_names.index('LHIP')] +
                         x[body25_names.index('RHIP')]) / 2

                abs_y = (y[body25_names.index('LHIP')] +
                         y[body25_names.index('RHIP')]) / 2

                abs_c = (c[body25_names.index('LHIP')] +
                         c[body25_names.index('RHIP')]) / 2

                res.append(abs_x)
                res.append(abs_y)
                res.append(abs_c)

    return res


def compare_21a_25b(video_name, frame):

    body21a = load_keypoints(os.path.join('tracking_results', video_name + ".mp4",
                                          f'{video_name}_0000000000{frame}_keypoints.json'))
    body25b = load_keypoints(os.path.join('tracking_results_body25b_416', video_name + ".mp4",
                                          f'{video_name}_0000000000{frame}_keypoints.json'))

    body25b21a = body_25b_to_21a(body25b)

    # body21_labels = list(range(21))
    body21_labels = body21a_names

    # body25_labels = list(range(25))
    body25_labels = body25_names

    plot_joints(body21a, body21_labels, 'body21a')
    plot_joints(body25b21a, body21_labels, 'body25b')


def plot_joints(keypoints, labels, plot_name):

    x, y, _ = decompose_keypoints(keypoints)

    # Create a scatter plot
    fig, ax = plt.subplots(figsize=(16, 12))
    ax.scatter(x, y)

    # print(x.shape, y.shape)

    for i, txt in enumerate(labels):
        ax.annotate(txt, (x[i], y[i]))
    # Display the plot
    # plt.show()

    plt.savefig(os.path.join('plots', plot_name + '.png'))
    plt.clf()


if __name__ == '__main__':

    compare_21a_25b("2_28-00_28-04", '80')
