import Deque from "./Deque";
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

	/**
	 * I have recored the 3d position of wrist and elbow in a time period, how do I decide if the movement is a toss, 
	 * and how to decide the toss direction and speed?

To determine if the movement is a toss and to calculate the toss direction and speed, you can follow these steps:

1. **Filter and preprocess the data:** If the recorded 3D position data is noisy, 
apply a filter (e.g., a low-pass filter or a moving average filter) to smooth the data.

2. **Calculate the displacement vector:** For each consecutive pair of data points, 
calculate the displacement vector of the wrist and elbow positions. 
This will give you the change in position for each time step.

3. **Calculate the velocity vector:** 
Divide the displacement vector by the time step to get the velocity vector for both the wrist and elbow.

4. **Identify the toss event:** Look for a rapid increase in the wrist's upward velocity, 
followed by a decrease in velocity (as the hand slows down to release the object). 
This could indicate a toss event. You can set a threshold for the velocity change to decide if the movement is a toss or not.

5. **Calculate the toss direction:** To find the toss direction, 
you can use the wrist's velocity vector at the moment of release. 
The direction of this vector indicates the direction of the toss.

6. **Calculate the toss speed:** The magnitude of the wrist's velocity vector at the moment of release gives you the toss speed.

Keep in mind that these calculations are based on the assumption that the recorded 3D positions are accurate and 
that the toss is mainly characterized by the wrist's movement. 
Depending on the specific context and the quality of your data, 
you might need to adjust these steps or apply additional techniques to improve the accuracy of your analysis.


How to use deep learning to help with this calculation, to make it more accurate

To use deep learning to improve the accuracy of detecting a toss event, direction, and speed, you can follow these steps:

1. **Collect a labeled dataset:** Gather a large dataset of 3D wrist and elbow positions during various activities, including tosses and non-tosses. Label each data point with the corresponding action (e.g., toss or not) and, if applicable, the toss direction and speed.

2. **Data preprocessing:** Normalize and preprocess the data as needed. This may include filtering, scaling, and segmenting the data into fixed-size windows.

3. **Design a neural network architecture:** Choose a suitable deep learning architecture for the task. For time-series data like 3D positions, you can use recurrent neural networks (RNNs), long short-term memory (LSTM) networks, or 1D convolutional neural networks (1D-CNNs).

4. **Train the model:** Split your dataset into training and validation sets, and train the neural network using the labeled data. You may need to experiment with different hyperparameters, such as learning rate, batch size, and the number of layers, to achieve the best performance.

5. **Evaluate the model:** Test the trained model on a separate test dataset to evaluate its performance in detecting toss events, directions, and speeds. You can use metrics like accuracy, precision, recall, and F1-score to assess the model's performance.

6. **Fine-tune the model:** Based on the evaluation results, fine-tune the model by adjusting its architecture or hyperparameters, and retrain it until you achieve satisfactory performance.

7. **Implement the trained model:** Integrate the trained deep learning model into your application to analyze the 3D wrist and elbow positions in real-time or offline. The model will output the predicted toss event, direction, and speed for each input data point or window.

By using a deep learning approach, you can potentially achieve more accurate and robust detection of toss events, directions, and speeds, as the model can learn complex patterns and features from the data that might be difficult to capture using traditional methods. However, keep in mind that deep learning models require a large amount of labeled data and computational resources for training.

How gether such data, is there sources available? if not recommend an approach to collect the data from internet or any public available sources.

There may not be readily available sources for the specific dataset you need (3D wrist and elbow positions during various activities). However, you can create your own dataset by following these approaches:

1. **Motion capture systems:** If you have access to a motion capture system or laboratory, you can record the movements of individuals performing various activities, including tosses and non-tosses. This will provide you with accurate 3D position data.

2. **Depth cameras:** Use a depth camera, like Microsoft Kinect, Intel RealSense, or other similar devices, to record people performing different activities. These cameras can provide you with 3D position data for body joints, including the wrist and elbow.

3. **Crowdsourcing:** You can crowdsource the data collection process by creating an online platform where users can upload videos of themselves performing various activities. You can then use computer vision techniques, such as OpenPose or MediaPipe, to extract 3D positions of the wrist and elbow from the videos. Keep in mind that this approach may require additional data cleaning and preprocessing, as the quality and consistency of the videos may vary.

4. **Publicly available video datasets:** Search for publicly available video datasets that contain people performing various activities, including tosses. Some examples of such datasets include UCF101, HMDB51, and Kinetics. Once you have the videos, you can use computer vision techniques, like OpenPose or MediaPipe, to extract the 3D positions of the wrist and elbow.

5. **Web scraping:** You can use web scraping tools and techniques to automatically download videos from websites like YouTube, where people might have uploaded videos of themselves performing various activities. You can then use computer vision techniques to extract the 3D positions of the wrist and elbow. Be mindful of copyright and privacy issues when using this approach.

After collecting the data, you will need to manually label the toss events, directions, and speeds, or use semi-automatic labeling techniques to save time. Once you have a labeled dataset, you can proceed with the deep learning steps mentioned in the previous answer.


	 * @param {*} left 
	 * @returns 
	 */

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
		if (velocity.length() > 30 && direction.z > 0.6) {
			// console.log("direction", direction);
			return velocity;
		}

		return false;
	}
}
