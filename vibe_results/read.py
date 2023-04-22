import os
import pickle
import joblib
import numpy as np
import json
import uuid

rpm_bones = [
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

smpl_skeleton = {
    0: 'pelvis',
    1: 'left_hip',
    2: 'right_hip',
    3: 'spine1',
    4: 'left_knee',
    5: 'right_knee',
    6: 'spine2',
    7: 'left_ankle',
    8: 'right_ankle',
    9: 'spine3',
    10: 'left_foot',
    11: 'right_foot',
    12: 'neck',
    13: 'left_collar',
    14: 'right_collar',
    15: 'head',
    16: 'left_shoulder',
    17: 'right_shoulder',
    18: 'left_elbow',
    19: 'right_elbow',
    20: 'left_wrist',
    21: 'right_wrist',
    22: 'left_hand',
    23: 'right_hand'
}

smpl_skeleton_idx = {value: key for key, value in smpl_skeleton.items()}

rpm_smpl_mapping = {
    # 'Hips': 'pelvis',
    # 'LeftUpLeg': 'left_hip',
    # 'RightUpLeg': 'right_hip',
    # 'Spine': 'spine1',
    # 'LeftLeg': 'left_knee',
    # 'RightLeg': 'right_knee',
    # 'Spine1': 'spine2',
    # 'LeftFoot': 'left_ankle',
    # 'RightFoot': 'right_ankle',
    # 'Spine2': 'spine3',
    # 'LeftToeBase': 'left_foot',
    # 'RightToeBase': 'right_foot',
    # 'Neck': 'neck',
    # 'LeftShoulder': 'left_collar',
    # 'RightShoulder': 'right_collar',
    # 'Head': 'head',
    'RightArm': 'left_shoulder',
    'LeftArm': 'right_shoulder',
    # 'LeftForeArm': 'right_elbow',
    # 'RightForeArm': 'left_elbow',
    # 'LeftHand': 'right_wrist',
    # 'RightHand': 'left_wrist',
}


def axis_angle_to_quaternion(axis_angle):

    # print(axis_angle)

    axis = axis_angle / np.linalg.norm(axis_angle)
    angle = np.linalg.norm(axis_angle)
    half_angle = angle / 2

    w = np.cos(half_angle)
    x, y, z = axis * np.sin(half_angle)

    return np.array([x, y, z, w])

# axis_angle = np.array([1.0, 2.0, 3.0])
# quaternion = axis_angle_to_quaternion(axis_angle)
# print(quaternion)


def apply_quaternion_to_vector(q, v):
    # Convert the quaternion to a rotation matrix
    r = np.array([[1-2*q[2]**2-2*q[3]**2, 2*q[1]*q[2]-2*q[3]*q[0], 2*q[1]*q[3]+2*q[2]*q[0]],
                  [2*q[1]*q[2]+2*q[3]*q[0], 1-2*q[1]**2 -
                      2*q[3]**2, 2*q[2]*q[3]-2*q[1]*q[0]],
                  [2*q[1]*q[3]-2*q[2]*q[0], 2*q[2]*q[3]+2*q[1]*q[0], 1-2*q[1]**2-2*q[2]**2]])
    # Apply the rotation matrix to the vector
    return np.dot(r, v)


def get_limb_tracks(pose_frame, limb_name, limb_upvector):
    axis_angles = pose_frame.reshape((24, 3))
    quaternions = np.apply_along_axis(
        axis_angle_to_quaternion, axis=1, arr=axis_angles)

    limb_quaternion = quaternions[smpl_skeleton_idx[limb_name]]

    target_vector = apply_quaternion_to_vector(limb_quaternion, limb_upvector)

    return target_vector / np.linalg.norm(target_vector)


def quat_multiply(a, b):
    """Multiply two quaternions."""
    x1, y1, z1, w1 = a
    x2, y2, z2, w2 = b
    return np.array([-x2*x1 - y2*y1 - z2*z1 + w2*w1,
                     x2*w1 + y2*z1 - z2*y1 + w2*x1,
                    -x2*z1 + y2*w1 + z2*x1 + w2*y1,
                     x2*y1 - y2*x1 + z2*w1 + w2*z1])


def combine_quaternions(a, b):
    """Combine two quaternions to represent their relative rotation."""
    a = np.array(a) / np.linalg.norm(a)
    b = np.array(b) / np.linalg.norm(b)
    c = quat_multiply(b, a)
    return c / np.linalg.norm(c)


if __name__ == '__main__':

    # with open('./output/air-squat.json', 'r') as f:
    #     anim = json.load(f)

    #     bones = []

    #     for item in anim['tracks']:
    #         bones.append(item['name'].replace('.quaternion', ''))

    #     print(bones)

    output = joblib.load('./vibe_output.pkl')

    tracks = {}

    for bone in rpm_bones:

        tracks[bone + '.quaternion'] = {
            "name": bone + '.quaternion',
            "type": "quaternion",
            "times": [],
            "values": []
        }

    # print(tracks)

    millisec = 0
    interval = 1000 / 30

    for pose_frame in output[1]['pose']:
        # print(pose.shape)

        axis_angles = pose_frame.reshape((24, 3))

        quaternions = np.apply_along_axis(
            axis_angle_to_quaternion, axis=1, arr=axis_angles)

        for bone in rpm_bones:

            tracks[bone + '.quaternion']['times'].append(millisec)

            if bone in rpm_smpl_mapping:

                quaternion = quaternions[smpl_skeleton_idx[rpm_smpl_mapping[bone]]]

                # if bone == 'LeftUpLeg':
                #     quaternion = combine_quaternions(
                #         np.array([0, 0, -1, 0]), quaternion)

                # if bone == 'RightUpLeg':
                #     quaternion = combine_quaternions(
                #         np.array([0, 0, 1, 0]), quaternion)

                # if bone == 'LeftFoot' or bone == 'RightFoot':

                #     quaternion = combine_quaternions(
                #         np.array([0.4947090394048656, 0, 0, 0.869058666794777]), quaternion)

                # the order of quaternion must be x, y, z, w
                for num in quaternion:
                    tracks[bone + '.quaternion']['values'].append(num)
            else:

                if bone == 'LeftUpLeg':
                    tracks[bone + '.quaternion']['values'].append(0)
                    tracks[bone + '.quaternion']['values'].append(0)
                    tracks[bone + '.quaternion']['values'].append(-1)
                    tracks[bone + '.quaternion']['values'].append(0)
                elif bone == 'RightUpLeg':
                    tracks[bone + '.quaternion']['values'].append(0)
                    tracks[bone + '.quaternion']['values'].append(0)
                    tracks[bone + '.quaternion']['values'].append(1)
                    tracks[bone + '.quaternion']['values'].append(0)
                elif bone == 'LeftShoulder':

                    tracks[bone +
                           '.quaternion']['values'].append(0.4820417046943355)
                    tracks[bone +
                           '.quaternion']['values'].append(0.49247702873907506)
                    tracks[bone +
                           '.quaternion']['values'].append(-0.5878678835040492)
                    tracks[bone +
                           '.quaternion']['values'].append(0.4236903617551159)
                elif bone == 'RightShoulder':

                    tracks[bone +
                           '.quaternion']['values'].append(0.4820417046943355)
                    tracks[bone +
                           '.quaternion']['values'].append(-0.49247702873907506)
                    tracks[bone +
                           '.quaternion']['values'].append(0.5878678835040492)
                    tracks[bone +
                           '.quaternion']['values'].append(0.4236903617551159)
                else:
                    tracks[bone + '.quaternion']['values'].append(0)
                    tracks[bone + '.quaternion']['values'].append(0)
                    tracks[bone + '.quaternion']['values'].append(0)
                    tracks[bone + '.quaternion']['values'].append(1)

        millisec += interval

    # print(tracks)
    # print(millisec)

    animation_name = 'test1'

    animation = {
        "name": animation_name,
        "duration": 10,
        "tracks": list(tracks.values()),
        "uuid": str(uuid.uuid4()),
        "blendMode": 2500,
    }

    filename = animation_name + '.json'

    with open(filename, 'w') as f:

        json.dump(animation, f)

        print('animation data saved to ' + filename)

    # print(output[1]['pose'].shape)
    # print(output[1]['pose'].shape)
    # print(output[1]['pose'][0])

    # for frame in output[1]['pose']:
    #     vec = get_limb_tracks(frame, 'pelvis', np.array([1,0,0]))

    #     print(vec)

    # pose_axis_angle_frame_0 = output[1]['pose'][0]

    # pose_axis_angle_frame_0 = pose_axis_angle_frame_0.reshape((24, 3))

    # # pose_quaternion_frame_0 = np.apply_along_axis(axisangle_quaternion_vectorized, axis=1, arr=pose_axis_angle_frame_0)
    # pose_quaternion_frame_0 = np.apply_along_axis(axis_angle_to_quaternion, axis=1, arr=pose_axis_angle_frame_0)

    # left_shoulder_quaternion = pose_quaternion_frame_0[smpl_skeleton_idx['left_shoulder']]

    # left_shoulder_upvector = np.array([1,0,0])

    # # print(left_shoulder_quaternion)
    # target_vector = apply_quaternion_to_vector(left_shoulder_quaternion, left_shoulder_upvector)

    # print(target_vector / np.linalg.norm(target_vector))

    # with open('./vibe_output.pkl', 'rb') as f:
    #     output = pickle.load(f)

    #     print(output)
