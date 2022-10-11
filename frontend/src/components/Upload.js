import React from "react";
import "./Home.css";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import VideoPlayer from "./VideoPlayer";
// import axios from "axios";

// Integrate navigator.getUserMedia & navigator.mediaDevices.getUserMedia
function getUserMedia(constraints, successCallback, errorCallback) {
	if (!constraints || !successCallback || !errorCallback) {
		return;
	}

	if (navigator.mediaDevices) {
		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(successCallback, errorCallback);
	} else {
		navigator.getUserMedia(constraints, successCallback, errorCallback);
	}
}

export default class Upload extends React.Component {
	constructor(props) {
		super(props);

		this.fileRef = React.createRef();

		this.selectVideo = this.selectVideo.bind(this);
		this.preprocessVideo = this.preprocessVideo.bind(this);
		this.uploadVideo = this.uploadVideo.bind(this);

		this.state = {

		};
	}

	componentDidMount() {

	}

	selectVideo() {
		this.fileRef.current.click();
	}

	preprocessVideo(event) {
		this.setState({
			videoFileObj: event.target.files[0],
		});
	}

	uploadVideo() {
		let formData = new FormData();
		formData.append("file", this.state.videoFileObj);
		formData.append("fileName", this.state.videoFileObj.name);

		fetch(process.env.REACT_APP_API_URL + '/upload/video', 
		{
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			// mode: 'cors', // no-cors, *cors, same-origin
			// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			// credentials: 'same-origin', // include, *same-origin, omit
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			// redirect: 'follow', // manual, *follow, error
			// referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			body: formData // body data type must match "Content-Type" header
		})
		.then((response) => response.json())
		.then((data) => {

			console.log(data)

		})
		.catch(function (error) {
			console.log(error.message, error.response, error.request, error.config);
		});
	}

	render() {
		return (
			<div>
				<div>
					<input
						ref={this.fileRef}
						type="file"
						accept=".mp4, wmv"
						onChange={this.preprocessVideo}
					/>
					<button onClick={this.selectVideo}>Select video</button>
					{this.state.videoFileObj && (
						<div>
							<span>{this.state.videoFileObj.name}</span>
							<span>{this.state.videoFileObj.type}</span>
							<span>
								{(
									this.state.videoFileObj.size /
									1024 /
									1024
								).toFixed(2)}
								MB
							</span>
						</div>
					)}
					<button onClick={this.uploadVideo}>Upload video</button>
				</div>
			</div>
		);
	}
}
