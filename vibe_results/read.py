import os
import pickle
import joblib
import numpy as np

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

def axis_angle_to_quaternion(axis_angle):

    # print(axis_angle)

    axis = axis_angle / np.linalg.norm(axis_angle)
    angle = np.linalg.norm(axis_angle)
    half_angle = angle / 2

    w = np.cos(half_angle)
    x, y, z = axis * np.sin(half_angle)

    return np.array([w, x, y, z])

# axis_angle = np.array([1.0, 2.0, 3.0])
# quaternion = axis_angle_to_quaternion(axis_angle)
# print(quaternion)

def apply_quaternion_to_vector(q, v):
    # Convert the quaternion to a rotation matrix
    r = np.array([[1-2*q[2]**2-2*q[3]**2, 2*q[1]*q[2]-2*q[3]*q[0], 2*q[1]*q[3]+2*q[2]*q[0]],
                  [2*q[1]*q[2]+2*q[3]*q[0], 1-2*q[1]**2-2*q[3]**2, 2*q[2]*q[3]-2*q[1]*q[0]],
                  [2*q[1]*q[3]-2*q[2]*q[0], 2*q[2]*q[3]+2*q[1]*q[0], 1-2*q[1]**2-2*q[2]**2]])
    # Apply the rotation matrix to the vector
    return np.dot(r, v)

def get_limb_tracks(pose_frame, limb_name, limb_upvector):
    axis_angles = pose_frame.reshape((24, 3))
    quaternions = np.apply_along_axis(axis_angle_to_quaternion, axis=1, arr=axis_angles)

    limb_quaternion = quaternions[smpl_skeleton_idx[limb_name]]

    target_vector = apply_quaternion_to_vector(limb_quaternion, limb_upvector)

    return target_vector / np.linalg.norm(target_vector)

if __name__ == '__main__':

    output = joblib.load('./vibe_output.pkl')

    # print(output[1].keys())
    # print(output[1]['pose'].shape)
    # print(output[1]['pose'][0])

    for frame in output[1]['pose']:
        vec = get_limb_tracks(frame, 'left_elbow', np.array([1,0,0]))

        print(vec)

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