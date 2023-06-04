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

    labels = list(range(22))

    # add labels to each point
    for i, txt in enumerate(labels):
        ax.text(x[i], y[i], z[i], txt)

    ax.set_xlabel("x")
    ax.set_ylabel("y")
    ax.set_zlabel("z")

    plt.savefig('tmp.png')
