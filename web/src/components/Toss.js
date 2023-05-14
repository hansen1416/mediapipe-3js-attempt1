import Deque from "../components/Deque";
import * as THREE from "three";

export default class Toss {
	constructor() {
		this.left_hand_track = new Deque();
		this.right_hand_track = new Deque();

		this.max_deque_length = 10;
	}

	getHandsPos(bones) {
		const left_hand = new THREE.Vector3();

		bones.LeftHand.getWorldPosition(left_hand);
		// Adds values to the end of a collection.
		this.left_hand_track.addBack(left_hand);

		if (this.left_hand_track.size() > this.max_deque_length) {
			// Removes a value from the beginning of a collection, and returns that value.
			this.left_hand_track.removeFront();
		}

		const right_hand = new THREE.Vector3();

		bones.RightHand.getWorldPosition(right_hand);

		this.right_hand_track.addBack(right_hand);

		if (this.right_hand_track.size() > this.max_deque_length) {
			// Removes a value from the beginning of a collection, and returns that value.
			this.right_hand_track.removeFront();
		}
	}

	getTrack(left = false) {
		if (left) {
			return this.left_hand_track.size() >= this.max_deque_length
				? this.left_hand_track
				: false;
		}

		return this.right_hand_track.size() >= this.max_deque_length
			? this.right_hand_track
			: false;
	}

	calculateAngularVelocity(left = false) {
		/**
         * To calculate the angular velocity of an object in 3D space, given its position in a interval of time, you can follow these steps:

1.First, determine the object's initial and final positions during the time interval.

2.Calculate the displacement vector of the object by subtracting the initial position vector from the final position vector.

3.Calculate the magnitude of the displacement vector by taking its length.

4.Determine the time interval over which the object moved.

5.Calculate the angular displacement of the object by dividing the magnitude of the displacement vector by the radius of the circular path it traveled.

6.Divide the angular displacement by the time interval to get the angular velocity.

7.The formula for calculating angular velocity is:

ω = Δθ/Δt

Where:
ω = angular velocity
Δθ = angular displacement
Δt = time interval

Note that the units of angular velocity are radians per second (rad/s).
         */

		const que = this.getTrack(left);

		if (!que) {
			return que;
		}

		const start = que.peekFront().clone();
		const end = que.peekBack().clone();

		end.sub(start);

		const direction = end.clone().normalize();
		// todo, decide what really is a toss
		if (direction.z > 0.6) {
			// console.log(direction);
		}
	}
}
