import BaseMotion from "./BaseMotion";

export default class Abdomen1 extends BaseMotion {
	constructor() {
		super();
	}

	initPose() {

		return Object.assign(this.spineFlatFaceUp(), this.handsHoldHeadBack(), this.legsCurveHorizontal());
	}
}
