import os
import json

import numpy as np


if __name__ == "__main__":

    pose_result_file = os.path.join('tmp', 'wlm0-3000.npy')

    pose_results = np.load(pose_result_file, allow_pickle=True)

    pose_results = [[{'x': pos[0], 'y': pos[1], 'z': pos[2],
                      'score': 0.8} for pos in item] for item in pose_results]

    with open('wlm0-300.json', 'w') as f:

        json.dump(pose_results, f)

    # print(pose_results)
