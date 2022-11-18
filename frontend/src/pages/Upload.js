// import React from "react";
import { useState, useRef } from "react";

export default function Upload() {
	// constructor(props) {
	// 	super(props);

	// 	fileRef = React.createRef();

	// 	selectVideo = selectVideo.bind(this);
	// 	preprocessVideo = preprocessVideo.bind(this);
	// 	uploadVideo = uploadVideo.bind(this);

	// 	state = {};
	// }

	const [videoFileObj, setvideoFileObj] = useState(null);
	const [uploadProgress, setuploadProgress] = useState(null);

	const fileRef = useRef(null);
	const intervalRef = useRef(null);

	function selectVideo() {
		fileRef.current.click();
	}

	function preprocessVideo(event) {
		setvideoFileObj(event.target.files[0]);
	}

	function uploadVideo() {
		let formData = new FormData();

		formData.append("file", videoFileObj);
		formData.append("fileName", videoFileObj.name);

		fetch(process.env.REACT_APP_API_URL + "/upload/video", {
			method: "POST", // *GET, POST, PUT, DELETE, etc.
			// mode: 'cors', // no-cors, *cors, same-origin
			// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			// credentials: 'same-origin', // include, *same-origin, omit
			// headers: {
			// 	"Content-Type": "multipart/form-data",
			// },
			// redirect: 'follow', // manual, *follow, error
			// referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			body: formData, // body data type must match "Content-Type" header
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.oss_key) {
					alert(data.oss_key + " is enqueued for upload");

					clearInterval(intervalRef.current);

					intervalRef.current = setInterval(
						checkUploadProgress,
						2000,
						data.oss_key
					);
				} else {
					alert("upload file failed");
				}
			})
			.catch(function (error) {
				console.log(
					error.message,
					error.response,
					error.request,
					error.config
				);
			});
	}

	function checkUploadProgress(oss_key) {
		fetch(
			process.env.REACT_APP_API_URL +
				"/upload/progress?" +
				new URLSearchParams({
					oss_key: oss_key,
				})
		)
			.then((response) => response.json())
			.then((data) => {
				if (data.progress) {
					setuploadProgress(data.progress);

					if (data.progress === "100") {
						clearInterval(intervalRef.current);

						setuploadProgress(null);
					}
				} else {
					alert("Reading file upload status failed");
				}
			})
			.catch(function (error) {
				console.log(
					error.message,
					error.response,
					error.request,
					error.config
				);
			});
	}

	return (
		<div>
			<div>
				<input
					ref={fileRef}
					type="file"
					accept=".mp4, wmv"
					onChange={preprocessVideo}
				/>
				<button onClick={selectVideo}>Select video</button>
				{videoFileObj && (
					<div>
						<span>{videoFileObj.name}</span>
						<span>{videoFileObj.type}</span>
						<span>
							{(videoFileObj.size / 1024 / 1024).toFixed(2)}
							MB
						</span>
					</div>
				)}
				<button onClick={uploadVideo}>Upload video</button>
			</div>
			{uploadProgress !== null && (
				<div>Upload progress: {uploadProgress}</div>
			)}
		</div>
	);
}
