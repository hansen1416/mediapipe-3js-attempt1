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

    pose_keypoints_2d = data['people'][0]['pose_keypoints_2d']

    # return np.array(data['people'][0]['pose_keypoints_2d'])
    # print(data['people'][0]['pose_keypoints_2d'])

    x = []
    y = []

    for i in range(0, len(pose_keypoints_2d)):
        if i % 3 == 0:
            x.append(pose_keypoints_2d[i])
        if i % 3 == 1:
            y.append(pose_keypoints_2d[i])

    return np.array(x), np.array(y)


def plot_joints(x, y, labels, plot_name):

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

    video_name = "2_28-37_28-42"
    frame = '10'

    body21a = os.path.join('tracking_results', video_name + ".mp4",
                           f'{video_name}_0000000000{frame}_keypoints.json')
    body25b = os.path.join('tracking_results_body25b_368', video_name + ".mp4",
                           f'{video_name}_0000000000{frame}_keypoints.json')

    body21a_x, body21a_y = load_keypoints(body21a)
    body25b_x, body25b_y = load_keypoints(body25b)

    # body21_labels = list(range(21))
    body21_labels = body21a_names

    # body25_labels = list(range(25))
    body25_labels = body25_names

    plot_joints(body21a_x, body21a_y, body21_labels, 'body21a')
    plot_joints(body25b_x, body25b_y, body25_labels, 'body25b')
