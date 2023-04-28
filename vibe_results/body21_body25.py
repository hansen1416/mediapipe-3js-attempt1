import json
import os

import matplotlib.pyplot as plt

body25_names = [
    "Nose",
    "Neck",
    "RShoulder",
    "RElbow",
    "RWrist",
    "LShoulder",
    "LElbow",
    "LWrist",
    "MidHip",
    "RHip",
    "RKnee",
    "RAnkle",
    "LHip",
    "LKnee",
    "LAnkle",
    "REye",
    "LEye",
    "REar",
    "LEar",
    "LBigToe",
    "LSmallToe",
    "LHeel",
    "RBigToe",
    "RSmallToe",
    "RHeel",
    # "Background"
]

def load_keypoints(file):
    
    with open(file) as f:
        data = json.load(f)

    # print(data['people'][0]['pose_keypoints_2d'])

    x = []
    y = []

    for i in range(0, len(data['people'][0]['pose_keypoints_2d'])):
        if i % 3 == 0:
            x.append(data['people'][0]['pose_keypoints_2d'][i])
        if i % 3 == 1:
            y.append(data['people'][0]['pose_keypoints_2d'][i])

    return x, y

def plot_joints(x, y, labels, plot_name):

    # Create a scatter plot
    fig, ax = plt.subplots(figsize=(16,12))
    ax.scatter(x, y)

    for i, txt in enumerate(labels):
        ax.annotate(txt, (x[i], y[i]))
    # Display the plot
    # plt.show()

    plt.savefig(os.path.join('plots', plot_name + '.png'))
    plt.clf()

if __name__ == '__main__':

    frame = '02'

    body21a = os.path.join('tracking_results', '2_29-40_29-44.mp4', f'2_29-40_29-44_0000000000{frame}_keypoints.json')
    body25b = os.path.join('tracking_results', '2_29-40_29-44.mp4.scale4', f'2_29-40_29-44_0000000000{frame}_keypoints.json')

    body21a_x, body21a_y = load_keypoints(body21a)
    body25b_x, body25b_y = load_keypoints(body25b)

    plot_joints(body21a_x, body21a_y, list(range(21)), 'body21a')
    plot_joints(body25b_x, body25b_y, body25_names, 'body25b')



