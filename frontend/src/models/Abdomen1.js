import * as THREE from "three";
import BaseMotion from './BaseMotion'

export default class Abdomen1 extends BaseMotion {

    constructor() {
        super()
    }

    initPose() {

        let SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0), 
            new THREE.Vector3(0,0,1),
        );

		let SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(0,0,1),
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0), 
            
        );

		const q_hips = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0), 
            new THREE.Vector3(0,0,1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(0,-1,0),
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0), 
            
        );

        const q_lshoulder = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0), 
            new THREE.Vector3(0,0,1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(-1,0,0),
            new THREE.Vector3(0,1,0), 
            
        );

        const q_rshoulder = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0.5,0.5,0),
            new THREE.Vector3(0,-0.5,0.5), 
            
        );

        const q_larm = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        
        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0.5,0.5,0),
            new THREE.Vector3(0,-0.5,0.5), 
            
        );

        const q_rarm = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(-1,0,0),
            new THREE.Vector3(0,0,1), 
            
        );

        const q_lforearm = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(-1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,0,1), 
            
        );

        const q_rforearm = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,1), 
            
        );

        const q_lhand = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,1), 
            
        );

        const q_rhand = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,-1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(-1,0,0),
            new THREE.Vector3(0,-0.5,0.5),
            new THREE.Vector3(0,0.5,0.5), 
        );

        const q_lthigh = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,-1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0.5,0.5,0),
            new THREE.Vector3(0,0.5,-0.5), 
            
        );

        const q_rthigh = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,-1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,0.5,-0.5),
            new THREE.Vector3(0,-0.5,-0.5),
        );

        const q_lcrus = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,0,-1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,0.5,-0.5),
            new THREE.Vector3(0,-0.5,-0.5),
        );

        const q_rcrus = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,1,-1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,0.5,0.5),
            new THREE.Vector3(0,0.5,-0.5),
        );

        const q_lfoot = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        SE0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,1,0),
            new THREE.Vector3(0,1,-1),
        );

		SE1 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(0,0.5,0.5),
            new THREE.Vector3(0,0.5,-0.5),
        );

        const q_rfoot = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

        return {
            'Hips': q_hips,
            'LeftShoulder': q_lshoulder,
            'LeftArm': q_larm,
            LeftForeArm: q_lforearm,
            LeftHand: q_lhand,
            RightShoulder: q_rshoulder,
            RightArm: q_rarm,
            RightForeArm: q_rforearm,
            RightHand: q_rhand,
            LeftUpLeg: q_lthigh,
            LeftLeg: q_lcrus,
            LeftFoot: q_lfoot,
            RightUpLeg: q_rthigh,
            RightLeg: q_rcrus,
            RightFoot: q_rfoot,
        }
    }
}