// ------------------------------------------
//  AVATAR CLASS
// ------------------------------------------

/**
 * 
 */

class AvatarPose {
    constructor(avatar, three) {
        this.THREE = three || window.THREE
        this.avatar = avatar
        this.mesh = this.avatar.scene || this.avatar.mesh
        this.mapSkeleton()
    }

    mapSkeleton() {
        this.bones = {}
        console.log(this.mesh)
        this.mesh.traverse((child) => {
            
            if (child.name == 'Hips')         { this.bones['Hips'] = child  }
            if (child.name == 'Chest')        { this.bones['Chest'] = child }

            if (child.name == 'LeftHand')     { this.bones['LeftHand']     = child }
            if (child.name == 'LeftForeArm')  { this.bones['LeftLowerArm'] = child }
            if (child.name == 'LeftArm')      { this.bones['LeftUpperArm'] = child }
            if (child.name == 'LeftUpLeg')    { this.bones['LeftUpperLeg'] = child }
            if (child.name == 'LeftLeg')      { this.bones['LeftLowerLeg'] = child }

            if (child.name == 'RightHand')    { this.bones['RightHand']     = child }
            if (child.name == 'RightForeArm') { this.bones['RightLowerArm'] = child }
            if (child.name == 'RightArm')     { this.bones['RightUpperArm'] = child }
            if (child.name == 'RightUpLeg')   { this.bones['RightUpperLeg'] = child }
            if (child.name == 'RightLeg')     { this.bones['RightLowerLeg'] = child }
            
            if (child.name == 'Spine')        { this.bones['Spine'] = child }
        })
        console.log(this.bones)
    }

    // https://github.com/rashgaroth/Face-Recognition/blob/b4d77fdac78f85e4a6d37a442abb02a540860942/scripts/kalidokit.js#L133
    setPose(results){ 

        let facelm      = results.faceLandmarks;
        let poselm      = results.poseLandmarks;
        let poselm3D    = results.ea;
        let rightHandlm = results.rightHandLandmarks;
        let leftHandlm  = results.leftHandLandmarks;
        
        if (!poselm || !poselm3D){ return; }

        let  riggedPose = Kalidokit.Pose.solve(poselm3D, poselm,{runtime:'mediapipe',video: $('#mediapipe-video')[0]})
        if (!riggedPose) { return; }

        this.rigRotation('Hips', riggedPose.Hips.rotation, 0.7)
        this.rigPosition('Hips', {
            x: -riggedPose.Hips.position.x, // Reverse direction
            y:  riggedPose.Hips.position.y + 1, // Add a bit of height
            z: -riggedPose.Hips.position.z // Reverse direction
        }, 1, 0.07)

        this.rigRotation('Chest', riggedPose.Spine, 0.25, 0.3)
        this.rigRotation('Spine', riggedPose.Spine, 0.45, 0.3)
    
        this.rigRotation('RightUpperArm', riggedPose.RightUpperArm, 1, 0.3)
        this.rigRotation('RightLowerArm', riggedPose.RightLowerArm, 1, 0.3)
        this.rigRotation('LeftUpperArm',  riggedPose.LeftUpperArm,  1, 0.3)
        this.rigRotation('LeftLowerArm',  riggedPose.LeftLowerArm,  1, 0.3)
    
        this.rigRotation('LeftUpperLeg',  riggedPose.LeftUpperLeg,  1, 0.3)
        this.rigRotation('LeftLowerLeg',  riggedPose.LeftLowerLeg,  1, 0.3)
        this.rigRotation('RightUpperLeg', riggedPose.RightUpperLeg, 1, 0.3)
        this.rigRotation('RightLowerLeg', riggedPose.RightLowerLeg, 1, 0.3)
    } 

    rigRotation (name, rotation, dampener, lerpAmount){
        dampener = dampener || 1
        lerpAmount = lerpAmount || 0.3

        let bone = this.bones[name]
        if (!bone) return;

        let euler = new this.THREE.Euler(rotation.x * dampener, rotation.y * dampener, rotation.z * dampener)
        let quaternion = new this.THREE.Quaternion().setFromEuler(euler)
        bone.quaternion.slerp(quaternion, lerpAmount) // interpolate
    }

    rigPosition (name, position, dampener, lerpAmount){
        dampener = dampener || 1
        lerpAmount = lerpAmount || 0.3

        let bone = this.bones[name]
        if (!bone) return;

        let vector = new this.THREE.Vector3(position.x * dampener, position.y * dampener, position.z * dampener)
        bone.position.lerp(vector, lerpAmount) // interpolate
    }
}
