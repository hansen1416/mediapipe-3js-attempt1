import { useState, useRef } from "react";
import VideoPlayer from "./VideoPlayer";

export default function Video() {
	const [videoJsOptions] = useState({
		autoplay: false,
		controls: true,
		// responsive: true,
		// fluid: true,
		playbackRates: [0.5, 1, 1.25, 1.5, 2],
		width: 720,
		height: 300,
		sources: [
			{
				src: "https://ifittest.oss-cn-shanghai.aliyuncs.com/8860f21aee324f9babf5bb1c771486c8/1665829847.0999663.mp4",
				// src: "https://ifittest.oss-cn-shanghai.aliyuncs.com/8860f21aee324f9babf5bb1c771486c8/1665831900.1388848.mp4",
				type: "video/mp4",
			},
		],
	});

	const videoCurrentTime = useRef(0);

	return (
		<div>
			<VideoPlayer
				{...videoJsOptions}
				onTimeUpdate={(playedTime) => {
					videoCurrentTime.current = playedTime;

					// console.log(videoCurrentTime);
				}}
			/>
		</div>
	);
}
