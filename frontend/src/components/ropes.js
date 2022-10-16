// Integrate navigator.getUserMedia & navigator.mediaDevices.getUserMedia
export function getUserMedia(constraints, successCallback, errorCallback) {
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
