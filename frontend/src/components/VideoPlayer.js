import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default class VideoPlayer extends React.Component {
	// Instantiate a Video.js player when the component mounts
	componentDidMount() {
		const timeupdatecallback = this.props.onTimeUpdate;

		// instantiate video.js
		this.player = videojs(
			this.videoNode,
			this.props,
			function onPlayerReady() {
				// console.log("onPlayerReady", this);
				this.on("timeupdate", function () {
					timeupdatecallback(this.currentTime());
					// console.log(this.currentTime());
				});
			}
		);

		if (this.videoNode) {
			this.videoNode.setAttribute("webkit-playsinline", true);
			this.videoNode.setAttribute("playsinline", true);
		}
	}

	// Dispose the player when the component will unmount
	componentWillUnmount() {
		// this will cause videojs be cleared in strict mode
		if (this.player) {
			this.player.dispose();
		}
	}

	// Wrap the player in a `div` with a `data-vjs-player` attribute, so Video.js
	// won't create additional wrapper in the DOM.
	//
	// See: https://github.com/videojs/video.js/pull/3856
	render() {
		return (
			<div data-vjs-player>
				<video
					ref={(node) => (this.videoNode = node)}
					className="video-js"
				></video>
			</div>
		);
	}
}
