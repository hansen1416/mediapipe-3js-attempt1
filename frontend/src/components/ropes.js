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

// 绑定事件
export function bindEvent(target, type, callback, remove, propa) {
	var remove = arguments[3] || "add",
		propagation = arguments[4] || false;
	target[remove + "EventListener"](type, callback, propagation);
}
