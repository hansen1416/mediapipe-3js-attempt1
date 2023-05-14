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
			if the velocity is in the right direction and has enough spped
			return velocity and let the ball fly
         */

		const que = this.getTrack(left);

		if (!que) {
			return que;
		}

		const velocity = que.peekBack().clone().sub(que.peekFront());
		const direction = velocity.clone().normalize();

		// todo, decide what really is a toss
		if (velocity.length() > 50 && direction.z > 0.6 && direction.y > -0.3) {
			// console.log("direction", direction);
			return velocity;
		}

		return false;
	}
}
