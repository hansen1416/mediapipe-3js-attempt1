import os
import json

import numpy as np

"""
[
    "Hips","Spine","Spine1","Spine2","Neck","Head",
    "LeftShoulder","LeftArm","LeftForeArm","LeftHand",
    "LeftHandThumb1","LeftHandThumb2","LeftHandThumb3",
    "LeftHandIndex1","LeftHandIndex2","LeftHandIndex3",
    "LeftHandMiddle1","LeftHandMiddle2","LeftHandMiddle3",
    "LeftHandRing1","LeftHandRing2","LeftHandRing3",
    "LeftHandPinky1","LeftHandPinky2","LeftHandPinky3",
    "RightShoulder","RightArm","RightForeArm","RightHand",
    "RightHandThumb1","RightHandThumb2","RightHandThumb3",
    "RightHandIndex1","RightHandIndex2","RightHandIndex3",
    "RightHandMiddle1","RightHandMiddle2","RightHandMiddle3",
    "RightHandRing1","RightHandRing2","RightHandRing3",
    "RightHandPinky1","RightHandPinky2","RightHandPinky3",
    "LeftUpLeg","LeftLeg","LeftFoot","LeftToeBase",
    "RightUpLeg","RightLeg","RightFoot","RightToeBase"
]

[
'root',

'pelvis','spine_01','spine_02','spine_03','neck_01','head',
'clavicle_l','upperarm_l','lowerarm_l','hand_l',
'thumb_01_l','thumb_02_l','thumb_03_l',
'index_01_l','index_02_l','index_03_l',
'middle_01_l','middle_02_l','middle_03_l',
'ring_01_l', 'ring_02_l','ring_03_l'
'pinky_01_l','pinky_02_l','pinky_03_l',
'clavicle_r','upperarm_r','lowerarm_r','hand_r',
'thumb_01_r','thumb_02_r','thumb_03_r',
'index_01_r','index_02_r','index_03_r',
'middle_01_r','middle_02_r','middle_03_r',
'ring_01_r','ring_02_r','ring_03_r',
'pinky_01_r','pinky_02_r','pinky_03_r',
'thigh_l','calf_l','foot_l','ball_l',
'thigh_r','calf_r','foot_r','ball_r',

'ik_foot_l','calf_twist_01_l','lowerarm_twist_01_l','ik_hand_l',
'upperarm_twist_01_l','ik_hand_r','lowerarm_twist_01_r','ik_hand_root',
'SK_Mannequin','SK_Mannequin_LOD0','ik_hand_gun','upperarm_twist_01_r',
'calf_twist_01_r','thigh_twist_01_l','thigh_twist_01_r','ik_foot_root',
'ik_foot_r',

]
"""

if __name__ == "__main__":
    """
    it will never work!!!!!
    """

    maximo_anim_dir = os.path.join('.', 'cascaanimjson')
    anim_dir = os.path.join('.', 'animjson')

    bones_casc = [
        'pelvis', 'spine_01', 'spine_02', 'spine_03', 'neck_01', 'head',
        'clavicle_l', 'upperarm_l', 'lowerarm_l', 'hand_l',
        'thumb_01_l', 'thumb_02_l', 'thumb_03_l',
        'index_01_l', 'index_02_l', 'index_03_l',
        'middle_01_l', 'middle_02_l', 'middle_03_l',
        'ring_01_l', 'ring_02_l', 'ring_03_l'
        'pinky_01_l', 'pinky_02_l', 'pinky_03_l',
        'clavicle_r', 'upperarm_r', 'lowerarm_r', 'hand_r',
        'thumb_01_r', 'thumb_02_r', 'thumb_03_r',
        'index_01_r', 'index_02_r', 'index_03_r',
        'middle_01_r', 'middle_02_r', 'middle_03_r',
        'ring_01_r', 'ring_02_r', 'ring_03_r',
        'pinky_01_r', 'pinky_02_r', 'pinky_03_r',
        'thigh_l', 'calf_l', 'foot_l', 'ball_l',
        'thigh_r', 'calf_r', 'foot_r', 'ball_r',
    ]

    bones_rpm = [
        "Hips", "Spine", "Spine1", "Spine2", "Neck", "Head",
        "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
        "LeftHandThumb1", "LeftHandThumb2", "LeftHandThumb3",
        "LeftHandIndex1", "LeftHandIndex2", "LeftHandIndex3",
        "LeftHandMiddle1", "LeftHandMiddle2", "LeftHandMiddle3",
        "LeftHandRing1", "LeftHandRing2", "LeftHandRing3",
        "LeftHandPinky1", "LeftHandPinky2", "LeftHandPinky3",
        "RightShoulder", "RightArm", "RightForeArm", "RightHand",
        "RightHandThumb1", "RightHandThumb2", "RightHandThumb3",
        "RightHandIndex1", "RightHandIndex2", "RightHandIndex3",
        "RightHandMiddle1", "RightHandMiddle2", "RightHandMiddle3",
        "RightHandRing1", "RightHandRing2", "RightHandRing3",
        "RightHandPinky1", "RightHandPinky2", "RightHandPinky3",
        "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase",
        "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase"
    ]

    bones_mapping = dict(zip(bones_casc, bones_rpm))

    print(bones_mapping)

    for fname in os.listdir(maximo_anim_dir):

        print(fname)

        with open(os.path.join(maximo_anim_dir, fname)) as f:
            data = json.load(f)

            for anim in data['tracks']:
                name_arr = anim['name'].split('.')

                if (name_arr[0] not in bones_mapping):
                    continue

                # print(bones_mapping[name_arr[0]])

                anim['name'] = bones_mapping[name_arr[0]] + '.' + name_arr[1]

        with open(os.path.join(anim_dir, fname), 'w') as f:

            json.dump(data, f)
