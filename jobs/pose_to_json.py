import os
import json

import numpy as np


if __name__ == "__main__":

    files = ['wlm0-3000.npy', 'wlm800-900.npy',
             'wlm1500-1600.npy', 'wlm2300-2400.npy']
    files = ['lm3960-4200.npy']

    dirname = 'tmp'
    dirname = 'pose_data'

    for fnname in files:

        pose_result_file = os.path.join(dirname, fnname)

        pose_results = np.load(pose_result_file, allow_pickle=True)

        pose_results = [[{'x': pos[0], 'y': pos[1], 'z': pos[2],
                        'score': 0.8} for pos in item] for item in pose_results]

        with open(fnname + '.json', 'w') as f:

            json.dump(pose_results, f)

        # print(pose_results)
