
import * as THREE from "three";

import { BlazePoseKeypointsValues } from "./ropes";

export default class PoseSyncVector {
    constructor() {

    }

    pose3dlimbs(pose3D) {
        
        const left_shoulder = poseToVector(
            pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]]
        );
        const left_elbow = poseToVector(
            pose3D[BlazePoseKeypointsValues["LEFT_ELBOW"]]
        );
        const left_wrist = poseToVector(
            pose3D[BlazePoseKeypointsValues["LEFT_WRIST"]]
        );

        const right_shoulder = poseToVector(
            pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]]
        );
        const right_elbow = poseToVector(
            pose3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]]
        );
        const right_wrist = poseToVector(
            pose3D[BlazePoseKeypointsValues["RIGHT_WRIST"]]
        );

        // const basisMatrix = getBasisFromPose(pose3D);

        // left_elbow.applyMatrix4(basisMatrix);
        // left_shoulder.applyMatrix4(basisMatrix);
        // left_wrist.applyMatrix4(basisMatrix);

        // right_elbow.applyMatrix4(basisMatrix);
        // right_shoulder.applyMatrix4(basisMatrix);
        // right_wrist.applyMatrix4(basisMatrix);

        const leftArmOrientation = posePointsToVector(
            left_elbow,
            left_shoulder
        );
        const leftForeArmOrientation = posePointsToVector(
            left_wrist,
            left_elbow
        );

        const rightArmOrientation = posePointsToVector(
            right_elbow,
            right_shoulder
        );
        const rightForeArmOrientation = posePointsToVector(
            right_wrist,
            right_elbow
        );

        return [leftArmOrientation, leftForeArmOrientation, rightArmOrientation, rightForeArmOrientation]
    }

    /**
     * @param {*} animationTracks 
     * @param {*} frameIndx 
     * @returns 
     */
    animationLimbs(animationTracks, frameIndx) {

        /**
         * "upperarm_l",
			"upperarm_r",
			"lowerarm_l",
			"lowerarm_r",
			"hand_l",
			"hand_r",
			"thigh_l",
			"thigh_r",
        */
        
        leftArmStates =
            animationTracks["upperarm_l.quaternion"]["states"][frameIndx];
        leftForeArmStates =
            animationTracks["lowerarm_l.quaternion"]["states"][frameIndx];

        rightArmStates =
            animationTracks["upperarm_r.quaternion"]["states"][frameIndx];
        rightForeArmStates =
            animationTracks["lowerarm_r.quaternion"]["states"][frameIndx];

        return [leftArmStates, leftForeArmStates, rightArmStates, rightForeArmStates]
    }

    compareCurrentPose(pose3D, animationTracks, frameIndx) {
        
        const l1 = this.pose3dlimbs(pose3D);
        const l2 = this.animationLimbs(animationTracks, frameIndx);

        const res = []

        for (let i in l1) {
            res.push(projectedDistance(l1[i], l2[i]))
        }

        return res
    }
}