
import * as THREE from "three";

import { BlazePoseKeypointsValues,poseToVector,posePointsToVector,projectedDistance } from "./ropes";

export default class PoseSyncVector {
    
    constructor(animation_data) {

        this.animationTracks = {}

        for (const v of animation_data.tracks) {

            this.animationTracks[v['name']] = v
		}
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
     * @param {*} frameIndx 
     * @returns 
     */
    // animationLimbs(frameIndx) {

    //     /**
    //      * "upperarm_l",
	// 		"upperarm_r",
	// 		"lowerarm_l",
	// 		"lowerarm_r",
	// 		"hand_l",
	// 		"hand_r",
	// 		"thigh_l",
	// 		"thigh_r",
    //     */
        
    //     const leftArmStates = new THREE.Vector3(this.animationTracks["upperarm_l.quaternion"]["states"][frameIndx].x,
    //     this.animationTracks["upperarm_l.quaternion"]["states"][frameIndx].x,
    //     this.animationTracks["upperarm_l.quaternion"]["states"][frameIndx].z).normalize();

    //     const leftForeArmStates = new THREE.Vector3(this.animationTracks["lowerarm_l.quaternion"]["states"][frameIndx].x,
    //     this.animationTracks["lowerarm_l.quaternion"]["states"][frameIndx].y,
    //     this.animationTracks["lowerarm_l.quaternion"]["states"][frameIndx].z).normalize();

    //     const rightArmStates = new THREE.Vector3(this.animationTracks["upperarm_r.quaternion"]["states"][frameIndx].x,
    //     this.animationTracks["upperarm_r.quaternion"]["states"][frameIndx].y,
    //     this.animationTracks["upperarm_r.quaternion"]["states"][frameIndx].z).normalize();

    //     const rightForeArmStates = new THREE.Vector3(this.animationTracks["lowerarm_r.quaternion"]["states"][frameIndx].x,
    //     this.animationTracks["lowerarm_r.quaternion"]["states"][frameIndx].y,
    //     this.animationTracks["lowerarm_r.quaternion"]["states"][frameIndx].z).normalize();

    //     return [leftArmStates, leftForeArmStates, rightArmStates, rightForeArmStates]
    // }

    animationLimbs(bones) {
        const upper = [
			["upperarm_l", "lowerarm_l"],
			["lowerarm_l", "hand_l"],
            ["upperarm_r", "lowerarm_r"],
			["lowerarm_r", "hand_r"],
		];

        const res = []

        for (let limb of upper) {

            const v_start = new THREE.Vector3();
            const v_end = new THREE.Vector3();

            bones[limb[0]].getWorldPosition(v_start);
            bones[limb[1]].getWorldPosition(v_end);

            const v = v_end.sub(v_start)

            res.push(v.normalize())
        }

        // console.log(res)

        return res
    }

    compareCurrentPose(pose3D, bones) {
        
        const l1 = this.pose3dlimbs(pose3D);
        // const l2 = this.animationLimbs(frameIndx);
        const l2 = this.animationLimbs(bones);

        const res = []

        for (let i in l1) {
            res.push(l1[i].angleTo(l2[i]))
        }

        return res
    }
}