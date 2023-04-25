import os
import json
import shutil

import numpy as np
import joblib

def read_posetrack_keypoints(output_folder):

    people = dict()

    for idx, result_file in enumerate(sorted(os.listdir(output_folder))):
        json_file = os.path.join(output_folder, result_file)
        data = json.load(open(json_file))
        # print(idx, data)
        for person in data['people']:
            person_id = person['person_id'][0]
            joints2d  = person['pose_keypoints_2d']
            if person_id in people.keys():
                people[person_id]['joints2d'].append(joints2d)
                people[person_id]['frames'].append(idx)
            else:
                people[person_id] = {
                    'joints2d': [],
                    'frames': [],
                }
                people[person_id]['joints2d'].append(joints2d)
                people[person_id]['frames'].append(idx)

    for k in people.keys():
        people[k]['joints2d'] = np.array(people[k]['joints2d']).reshape((len(people[k]['joints2d']), -1, 3))
        people[k]['frames'] = np.array(people[k]['frames'])

    return people

if __name__ == "__main__":

    MIN_NUM_FRAMES = 25

    # tracking_results = read_posetrack_keypoints('output_json')
    tracking_results = read_posetrack_keypoints('output')

        # remove tracklets if num_frames is less than MIN_NUM_FRAMES
    for person_id in list(tracking_results.keys()):
        if tracking_results[person_id]['frames'].shape[0] < MIN_NUM_FRAMES:
            del tracking_results[person_id]

    # print(tracking_results[-1].keys())

    # joblib.dump(tracking_results, os.path.join('.', "tracking_results_openpose.pkl"))
    data = joblib.load("tracking_results_openpose.pkl")

    np.save('joints2d.npy', data[0]['joints2d'])
    np.save('frames.npy', data[0]['frames'])
# 
    print(data[0]['joints2d'].shape)
    print(data[0]['frames'].shape)


    # data = joblib.load('./tracking_results.pkl')

    # print(data[1].keys())