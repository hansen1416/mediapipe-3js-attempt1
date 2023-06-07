import json
import os
import numpy as np


def load_joints_pos(filename):

    with open(os.path.join('joints_pos', filename)) as f:
        data = np.array([[v['x'], v['y'], v['z']]for v in json.load(f)])

    return data


def calculate_limb_vec(start_joints_pos, end_joints_pos):

    result = np.apply_along_axis(
        lambda x, y: y - x, 1, start_joints_pos, end_joints_pos)

    return result


if __name__ == "__main__":

    leftarm_positions = load_joints_pos('1.json')
    rightarm_positions = load_joints_pos('2.json')
    leftforearm_positions = load_joints_pos('3.json')
    rightforearm_positions = load_joints_pos('4.json')
    lefthand_positions = load_joints_pos('5.json')
    righthand_positions = load_joints_pos('6.json')

    # print(leftarm_positions)
    # print(leftforearm_positions)

    leftupperarm = calculate_limb_vec(leftarm_positions, leftforearm_positions)
    rightupperarm = calculate_limb_vec(rightarm_positions, rightforearm_positions)

    leftlowerarm = calculate_limb_vec(leftforearm_positions, lefthand_positions)
    rightlowerarm = calculate_limb_vec(rightforearm_positions, righthand_positions)

    print(rightupperarm)
    print(leftlowerarm)
    print(rightlowerarm)

    # print(leftforearm_positions)
    # print(rightforearm_positions)
    # print(lefthand_positions)
    # print(righthand_positions)
