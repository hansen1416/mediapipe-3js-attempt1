import json
import os

import numpy as np

animation_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'animations')

def analyse_motion(data):
    # print(data.keys()) # dict_keys(['name', 'duration', 'tracks', 'uuid', 'blendMode'])
    print(data['name'])
    # print(len(data['tracks']))

    for i in data['tracks']:
        
        if i['type'] != 'quaternion':
            continue

        print(i['Vectors'])

        break

if __name__ == "__main__":

    for name in os.listdir(animation_dir):

        with open(os.path.join(animation_dir, name), 'r') as f:

            data = json.load(f)

            analyse_motion(data)

        break

    # anim = json.load()

    