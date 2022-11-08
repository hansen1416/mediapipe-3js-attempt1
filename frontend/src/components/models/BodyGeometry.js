import * as THREE from "three";
import { rect } from "../ropes";

export class BodyGeometry {
	constructor() {

		this.skincolor0 = [239, 214, 178];
		this.skincolor1 = [241, 194, 125];
		this.skincolor2 = [230, 186, 118];
		this.skincolor3 = [212, 167, 99];
		/**** positions on the body */
		// shoulder to body x
		this.sd_xt = 1.2;
		// deltoid farx, distance away from body
		this.dd_xa = -2.2;
		// upper deltoid far z positive
		this.dd_zf = 1.3;
		// bicep far x negative, away from body
		this.bp_xa = -1.66;
		// bicep far x, towards body
		this.bp_xt = 1.39;
		// bicep far z positive
		this.u_bp_y1_zn2 = 1.46;
		// upper bicep far y negative
		this.u_bp_y = -5.4;
		// lower bicep far y negative
		this.l_bp_y1 = -9;
		// lower bicep end positove z
		this.l_bp_y1_xp0 = 1.0;
		this.l_bp_y1_xp1 = 1.0;

		this.l_bp_y1_xn0 = -1.4;
		this.l_bp_y1_xn2 = -1.4;
		this.l_bp_y1_xn4 = -1;

		this.l_bp_y1_zp1 = 1;
		this.l_bp_y1_zp2 = 1;
		this.l_bp_y1_zp3 = 0.6;
		this.l_bp_y1_zp4 = 0.4;

		this.l_bp_y1_zn4 = -0.4;

		//******* */
		this.upperarmPosInit();

		this.elbowPosInit();

		this.forearmPosInit();
	}

	upperarmPosInit() {

		this.ua_ym1 = 0.25;

		this.ua_y0_x0 = 0;
		this.ua_y0_x1 = -0.8;
		this.ua_y0_x2 = -1.4;
		this.ua_y0_x3 = -0.8;
		this.ua_y0_x4 = 0;
		this.ua_y0_x5 = 1.2;
		this.ua_y0_x6 = 1.2;
		this.ua_y0_x7 = 1.2;
		this.ua_y0_x8 = 1.2;
		this.ua_y0_x9 = 1.2;

		this.ua_y0_z0 = 1;
		this.ua_y0_z1 = -0.8;
		this.ua_y0_z2 = -1.4;
		this.ua_y0_z3 = -0.8;
		this.ua_y0_z4 = 0;
		this.ua_y0_z5 = 1.2;
		this.ua_y0_z6 = 1.2;
		this.ua_y0_z7 = 1.2;
		this.ua_y0_z8 = 1.2;
		this.ua_y0_z9 = 1.2;
	}

	elbowPosInit() {
		// elbow
		this.eb_y0 = 0;

		this.eb_y0_x0 = -1;
		this.eb_y0_x1 = -1.4;
		this.eb_y0_x2 = -1.4;
		this.eb_y0_x3 = -1.4;
		this.eb_y0_x4 = -1;
		this.eb_y0_x5 = 0;
		this.eb_y0_x6 = 1;
		this.eb_y0_x7 = 1;
		this.eb_y0_x8 = 1;
		this.eb_y0_x9 = 0;

		this.eb_y0_z0 = 1;
		this.eb_y0_z1 = 0.6;
		this.eb_y0_z2 = 0;
		this.eb_y0_z3 = -0.6;
		this.eb_y0_z4 = -1;
		this.eb_y0_z5 = -1;
		this.eb_y0_z6 = -0.4;
		this.eb_y0_z7 = 0;
		this.eb_y0_z8 = 0.4;
		this.eb_y0_z9 = 1;

		this.eb_y1 = -0.6;

		this.eb_y1_x0 = -1;
		this.eb_y1_x1 = -1.4;
		this.eb_y1_x2 = -1.6;
		this.eb_y1_x3 = -1.4;
		this.eb_y1_x4 = -1;
		this.eb_y1_x5 = 0;
		this.eb_y1_x6 = 0.9;
		this.eb_y1_x7 = 0.8;
		this.eb_y1_x8 = 0.7;
		this.eb_y1_x9 = 0;

		this.eb_y1_z0 = 1;
		this.eb_y1_z1 = 0.6;
		this.eb_y1_z2 = 0;
		this.eb_y1_z3 = -0.6;
		this.eb_y1_z4 = -1;
		this.eb_y1_z5 = -1;
		this.eb_y1_z6 = -0.4;
		this.eb_y1_z7 = 0;
		this.eb_y1_z8 = 0.4;
		this.eb_y1_z9 = 0.8;

		this.eb_y2 = -1.2;

		this.eb_y2_x0 = -1;
		this.eb_y2_x1 = -1.4;
		this.eb_y2_x2 = -1.4;
		this.eb_y2_x3 = -1.4;
		this.eb_y2_x4 = -1;
		this.eb_y2_x5 = 0;
		this.eb_y2_x6 = 0.9;
		this.eb_y2_x7 = 0.9;
		this.eb_y2_x8 = 0.9;
		this.eb_y2_x9 = 0;

		this.eb_y2_z0 = 1;
		this.eb_y2_z1 = 0.6;
		this.eb_y2_z2 = 0;
		this.eb_y2_z3 = -0.6;
		this.eb_y2_z4 = -1;
		this.eb_y2_z5 = -1;
		this.eb_y2_z6 = -0.4;
		this.eb_y2_z7 = 0;
		this.eb_y2_z8 = 0.4;
		this.eb_y2_z9 = 1;
	}

	forearmPosInit() {
		// forearm
		this.fa_y0 = 0;

		this.fa_y1 = -1.6;

		this.fa_y1_x0 = -1;
		this.fa_y1_x1 = -1.2;
		this.fa_y1_x2 = -1.3;
		this.fa_y1_x3 = -1.2;
		this.fa_y1_x4 = -1;
		this.fa_y1_x5 = -0;
		this.fa_y1_x6 = 0.9;
		this.fa_y1_x7 = 1.0;
		this.fa_y1_x8 = 0.9;
		this.fa_y1_x9 = -0;

		this.fa_y1_z0 = 1.4;
		this.fa_y1_z1 = 0.5;
		this.fa_y1_z2 = 0;
		this.fa_y1_z3 = -0.5;
		this.fa_y1_z4 = -1.4;
		this.fa_y1_z5 = -1.4;
		this.fa_y1_z6 = -0.6;
		this.fa_y1_z7 = 0;
		this.fa_y1_z8 = 0.6;
		this.fa_y1_z9 = 1.4;

		this.fa_y2 = -7;

		this.fa_y2_x0 = -0.3;
		this.fa_y2_x1 = -0.5;
		this.fa_y2_x2 = -0.6;
		this.fa_y2_x3 = -0.5;
		this.fa_y2_x4 = -0.3;
		this.fa_y2_x5 = 0.3;
		this.fa_y2_x6 = 0.5;
		this.fa_y2_x7 = 0.6;
		this.fa_y2_x8 = 0.5;
		this.fa_y2_x9 = 0.3;

		this.fa_y2_z0 = 0.6;
		this.fa_y2_z1 = 0.1;
		this.fa_y2_z2 = 0;
		this.fa_y2_z3 = -0.1;
		this.fa_y2_z4 = -0.6;
		this.fa_y2_z5 = -0.6;
		this.fa_y2_z6 = -0.1;
		this.fa_y2_z7 = 0;
		this.fa_y2_z8 = 0.1;
		this.fa_y2_z9 = 0.6;
	}

	deltoid(u) {
		const vertices = [
			// top of shoulder outside
			{ pos: [0, 0.25, 0] },
			{ pos: [-0.8, -0.3, 1] },
			{ pos: [0, -0.3, 1] },

			{ pos: [0, 0.25, 0] },
			{ pos: [-1.4, 0, 0] },
			{ pos: [-0.8, -0.3, 1] },

			{ pos: [0, 0.25, 0] },
			{ pos: [-0.8, -0.3, -1] },
			{ pos: [-1.4, 0, 0] },

			{ pos: [0, 0.25, 0] },
			{ pos: [0, -0.3, -1] },
			{ pos: [-0.8, -0.3, -1] },

			// top of shoulder inside

			{ pos: [0, 0.25, 0] },
			{ pos: [0, -0.3, 1] },
			{ pos: [this.sd_xt, -0.3, 1] },

			{ pos: [0, 0.25, 0] },
			{ pos: [this.sd_xt, -0.3, 1] },
			{ pos: [this.sd_xt, 0.1, 0] },

			{ pos: [this.sd_xt, 0.1, 0] },
			{ pos: [this.sd_xt, -0.3, -1] },
			{ pos: [0, 0.25, 0] },

			{ pos: [this.sd_xt, -0.3, -1] },
			{ pos: [0, -0.3, -1] },
			{ pos: [0, 0.25, 0] },

			// upper deltoid outside

			{ pos: [0, -0.3, 1] },
			{ pos: [-0.8, -0.3, 1] },
			{ pos: [0, -1.4, this.dd_zf] },

			{ pos: [0, -1.4, this.dd_zf] },
			{ pos: [-0.8, -0.3, 1] },
			{ pos: [-1, -1.4, this.dd_zf] },

			{ pos: [-0.8, -0.3, 1] },
			{ pos: [-1.7, -1.4, 0.7] },
			{ pos: [-1, -1.4, this.dd_zf] },

			{ pos: [-0.8, -0.3, 1] },
			{ pos: [-1.4, 0, 0] },
			{ pos: [-1.7, -1.4, 0.7] },

			{ pos: [-1.7, -1.4, 0.7] },
			{ pos: [-1.4, 0, 0] },
			{ pos: [this.dd_xa, -1.4, 0] },

			// upper deltoid inside, positove z

			{ pos: [-0.8, -0.3, 1] },
			{ pos: [0, -1.4, this.dd_zf] },
			{ pos: [this.sd_xt, -0.3, 1] },

			{ pos: [0, -1.4, this.dd_zf] },
			{ pos: [this.sd_xt, -1.4, this.dd_zf] },
			{ pos: [this.sd_xt, -0.3, 1] },

			{ pos: [0, -1.4, 1.3] },
			{ pos: [0, -2.2, 1.1] },
			{ pos: [this.sd_xt, -1.4, 1.3] },

			// upper deltoid inside, negative z

			{ pos: [-0.8, -0.3, -1] },
			{ pos: [this.sd_xt, -0.3, -1] },
			{ pos: [0, -1.4, -this.dd_zf] },

			{ pos: [0, -1.4, -this.dd_zf] },
			{ pos: [this.sd_xt, -0.3, -1] },
			{ pos: [this.sd_xt, -1.4, -this.dd_zf] },

			{ pos: [0, -1.4, -1.3] },
			{ pos: [this.sd_xt, -1.4, -1.3] },
			{ pos: [0, -2.2, -1.1] },

			// middle line of upper deltoid

			{ pos: [-1.4, 0, 0] },
			{ pos: [-1.7, -1.4, -0.7] },
			{ pos: [this.dd_xa, -1.4, 0] },

			{ pos: [-1.4, 0, 0] },
			{ pos: [-0.8, -0.3, -1] },
			{ pos: [-1.7, -1.4, -0.7] },

			{ pos: [-0.8, -0.3, -1] },
			{ pos: [-1, -1.4, -1.3] },
			{ pos: [-1.7, -1.4, -0.7] },

			{ pos: [0, -1.4, -1.3] },
			{ pos: [-1, -1.4, -1.3] },
			{ pos: [-0.8, -0.3, -1] },

			{ pos: [0, -0.3, -1] },
			{ pos: [0, -1.4, -1.3] },
			{ pos: [-0.8, -0.3, -1] },

			// lower deltoid
			{ pos: [0, -1.4, 1.3] },
			{ pos: [-1, -1.4, 1.3] },
			{ pos: [0, -2.2, 1.1] },

			{ pos: [0, -2.2, 1.1] },
			{ pos: [-1, -1.4, 1.3] },
			{ pos: [-1, -2.8, 1.0] },

			{ pos: [-1, -2.8, 1.0] },
			{ pos: [-1, -1.4, 1.3] },
			{ pos: [-1.7, -1.4, 0.7] },

			{ pos: [-1, -2.8, 1.0] },
			{ pos: [-1.7, -1.4, 0.7] },
			{ pos: [this.dd_xa, -1.4, 0] },

			{ pos: [-1, -2.8, 1.0] },
			{ pos: [this.dd_xa, -1.4, 0] },
			{ pos: [-1.2, -3.6, 0] },

			// lower deltoid middle line

			{ pos: [-1.2, -3.6, 0] },
			{ pos: [this.dd_xa, -1.4, 0] },
			{ pos: [-1, -2.8, -1.0] },

			{ pos: [-1, -2.8, -1.0] },
			{ pos: [this.dd_xa, -1.4, 0] },
			{ pos: [-1.7, -1.4, -0.7] },

			{ pos: [-1, -2.8, -1.0] },
			{ pos: [-1.7, -1.4, -0.7] },
			{ pos: [-1, -1.4, -1.3] },

			{ pos: [0, -2.2, -1.1] },
			{ pos: [-1, -2.8, -1.0] },
			{ pos: [-1, -1.4, -1.3] },

			{ pos: [0, -1.4, -1.3] },
			{ pos: [0, -2.2, -1.1] },
			{ pos: [-1, -1.4, -1.3] },
		];

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return vertices;
	}

	bicep(u) {
		const vertices = [
			//  upper bicep, negative x, away from body

			...rect(
				[-1, -2.8, 1.0],
				[0, -2.2, 1.1],
				[0, this.u_bp_y, this.u_bp_y1_zn2],
				[-1, this.u_bp_y, this.u_bp_y1_zn2]
			),

			...rect(
				[-1.2, -3.6, 0],
				[-1, -2.8, 1.0],
				[-1, this.u_bp_y, this.u_bp_y1_zn2],
				[-1.4, this.u_bp_y, 1.2]
			),

			{ pos: [-1.4, this.u_bp_y, 1.2] },
			{ pos: [-1.2, -3.6, 0] },
			{ pos: [this.bp_xa, this.u_bp_y, 0] },

			//  upper bicep, positive x, close to body

			{ pos: [0, -2.2, 1.1] },
			{ pos: [1, -2.8, 1.1] },
			{ pos: [this.sd_xt, -1.4, 1.3] },

			{ pos: [0, -2.2, 1.1] },
			{ pos: [0, this.u_bp_y, this.u_bp_y1_zn2] },
			{ pos: [1, -2.8, 1.1] },

			{ pos: [0, this.u_bp_y, this.u_bp_y1_zn2] },
			{ pos: [1, this.u_bp_y, 1.0] },
			{ pos: [1, -2.8, 1.1] },

			{ pos: [1, -2.8, 1.1] },
			{ pos: [1, this.u_bp_y, 1.0] },
			{ pos: [this.bp_xt, this.u_bp_y, 0] },

			{ pos: [1, -2.8, 1.1] },
			{ pos: [this.bp_xt, this.u_bp_y, 0] },
			{ pos: [this.bp_xt, -2.8, 0] },

			//  upper bicep, positive x, close to body, middle line

			{ pos: [1, -2.8, -1.1] },
			{ pos: [this.bp_xt, -2.8, 0] },
			{ pos: [this.bp_xt, this.u_bp_y, 0] },

			{ pos: [1, -2.8, -1.1] },
			{ pos: [this.bp_xt, this.u_bp_y, 0] },
			{ pos: [1, this.u_bp_y, -1.0] },

			{ pos: [0, this.u_bp_y, -this.u_bp_y1_zn2] },
			{ pos: [1, -2.8, -1.1] },
			{ pos: [1, this.u_bp_y, -1.0] },

			{ pos: [0, -2.2, -1.1] },
			{ pos: [1, -2.8, -1.1] },
			{ pos: [0, this.u_bp_y, -this.u_bp_y1_zn2] },

			{ pos: [0, -2.2, -1.1] },
			{ pos: [this.sd_xt, -1.4, -1.3] },
			{ pos: [1, -2.8, -1.1] },

			// upper bicep middle line

			{ pos: [this.bp_xa, this.u_bp_y, 0] },
			{ pos: [-1.2, -3.6, 0] },
			{ pos: [-1.4, this.u_bp_y, -1.2] },

			{ pos: [-1.4, this.u_bp_y, -1.2] },
			{ pos: [-1.2, -3.6, 0] },
			{ pos: [-1, -2.8, -1.0] },

			{ pos: [-1, this.u_bp_y, -this.u_bp_y1_zn2] },
			{ pos: [-1.4, this.u_bp_y, -1.2] },
			{ pos: [-1, -2.8, -1.0] },

			{ pos: [0, this.u_bp_y, -this.u_bp_y1_zn2] },
			{ pos: [-1, this.u_bp_y, -this.u_bp_y1_zn2] },
			{ pos: [-1, -2.8, -1.0] },

			{ pos: [0, -2.2, -1.1] },
			{ pos: [0, this.u_bp_y, -this.u_bp_y1_zn2] },
			{ pos: [-1, -2.8, -1.0] },

			// lower bicep

			...rect(
				[this.l_bp_y1_xn4, this.u_bp_y, this.u_bp_y1_zn2],
				[0, this.u_bp_y, this.u_bp_y1_zn2],
				[0, this.l_bp_y1, this.l_bp_y1_zp2],
				[this.l_bp_y1_xn4, this.l_bp_y1, this.l_bp_y1_zp1]
			),
			...rect(
				[-1.4, this.u_bp_y, 1.2],
				[this.l_bp_y1_xn4, this.u_bp_y, this.u_bp_y1_zn2],

				[this.l_bp_y1_xn4, this.l_bp_y1, this.l_bp_y1_zp1],
				[this.l_bp_y1_xn2, this.l_bp_y1, this.l_bp_y1_zp3]
			),
			...rect(
				[this.bp_xa, this.u_bp_y, 0],
				[-1.4, this.u_bp_y, 1.2],
				[this.l_bp_y1_xn2, this.l_bp_y1, this.l_bp_y1_zp3],
				[this.l_bp_y1_xn0, this.l_bp_y1, 0]
			),

			// lower bicep, positive x, positive z, close to body

			...rect(
				[0, this.u_bp_y, this.u_bp_y1_zn2],
				[1, this.u_bp_y, 1.0],
				[1, this.l_bp_y1, this.l_bp_y1_zp4],
				[0, this.l_bp_y1, this.l_bp_y1_zp2]
			),

			...rect(
				[1, this.u_bp_y, 1.0],
				[this.bp_xt, this.u_bp_y, 0],
				[1, this.l_bp_y1, 0],
				[1, this.l_bp_y1, this.l_bp_y1_zp4]
			),

			// lower bicep, positive x, negative z, close to body

			...rect(
				[this.bp_xt, this.u_bp_y, 0],
				[1, this.u_bp_y, -1.0],
				[this.l_bp_y1_xp1, this.l_bp_y1, this.l_bp_y1_zn4],
				[this.l_bp_y1_xp0, this.l_bp_y1, 0]
			),

			...rect(
				[1, this.u_bp_y, -1.0],
				[0, this.u_bp_y, -this.u_bp_y1_zn2],
				[0, this.l_bp_y1, -this.l_bp_y1_zp2],
				[this.l_bp_y1_xp1, this.l_bp_y1, this.l_bp_y1_zn4]
			),

			// lower bicep middle line

			...rect(
				[-1.4, this.u_bp_y, -1.2],
				[this.bp_xa, this.u_bp_y, 0],
				[-1.4, this.l_bp_y1, 0],
				[-1.4, this.l_bp_y1, -0.6]
			),

			...rect(
				[-1, this.u_bp_y, -this.u_bp_y1_zn2],
				[-1.4, this.u_bp_y, -1.2],
				[-1.4, this.l_bp_y1, -0.6],
				[-1, this.l_bp_y1, -1]
			),

			...rect(
				[0, this.u_bp_y, -this.u_bp_y1_zn2],
				[-1, this.u_bp_y, -this.u_bp_y1_zn2],
				[-1, this.l_bp_y1, -1],
				[0, this.l_bp_y1, -1]
			),
		];

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return vertices;

		// return this.bufferGeo(0xf1c27d, vertices);
	}

	elbow(u) {
		const vertices = [
			...rect(
				[this.eb_y0_x0, this.eb_y0, this.eb_y0_z0],
				[this.eb_y0_x9, this.eb_y0, this.eb_y0_z9],
				[this.eb_y1_x9, this.eb_y1, this.eb_y1_z9],
				[this.eb_y1_x0, this.eb_y1, this.eb_y1_z0],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y0_x1, this.eb_y0, this.eb_y0_z1],
				[this.eb_y0_x0, this.eb_y0, this.eb_y0_z0],
				[this.eb_y1_x0, this.eb_y1, this.eb_y1_z0],
				[this.eb_y1_x1, this.eb_y1, this.eb_y1_z1],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y0_x2, this.eb_y0, this.eb_y0_z2],
				[this.eb_y0_x1, this.eb_y0, this.eb_y0_z1],
				[this.eb_y1_x1, this.eb_y1, this.eb_y1_z1],
				[this.eb_y1_x2, this.eb_y1, this.eb_y1_z2],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor3,
			),

			...rect(
				[this.eb_y0_x3, this.eb_y0, this.eb_y0_z3],
				[this.eb_y0_x2, this.eb_y0, this.eb_y0_z2],
				[this.eb_y1_x2, this.eb_y1, this.eb_y1_z2],
				[this.eb_y1_x3, this.eb_y1, this.eb_y1_z3],
				this.skincolor2, this.skincolor2, this.skincolor3 ,this.skincolor2,
			),

			...rect(
				[this.eb_y0_x4, this.eb_y0, this.eb_y0_z4],
				[this.eb_y0_x3, this.eb_y0, this.eb_y0_z3],
				[this.eb_y1_x3, this.eb_y1, this.eb_y1_z3],
				[this.eb_y1_x4, this.eb_y1, this.eb_y1_z4],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y0_x5, this.eb_y0, this.eb_y0_z5],
				[this.eb_y0_x4, this.eb_y0, this.eb_y0_z4],
				[this.eb_y1_x4, this.eb_y1, this.eb_y1_z4],
				[this.eb_y1_x5, this.eb_y1, this.eb_y1_z5],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y0_x6, this.eb_y0, this.eb_y0_z6],
				[this.eb_y0_x5, this.eb_y0, this.eb_y0_z5],
				[this.eb_y1_x5, this.eb_y1, this.eb_y1_z5],
				[this.eb_y1_x6, this.eb_y1, this.eb_y1_z6],
				null, this.skincolor2, this.skincolor2, null,
			),
			
			...rect(
				[this.eb_y0_x7, this.eb_y0, this.eb_y0_z7],
				[this.eb_y0_x6, this.eb_y0, this.eb_y0_z6],
				[this.eb_y1_x6, this.eb_y1, this.eb_y1_z6],
				[this.eb_y1_x7, this.eb_y1, this.eb_y1_z7],
			),
			
			...rect(
				[this.eb_y0_x8, this.eb_y0, this.eb_y0_z8],
				[this.eb_y0_x7, this.eb_y0, this.eb_y0_z7],
				[this.eb_y1_x7, this.eb_y1, this.eb_y1_z7],
				[this.eb_y1_x8, this.eb_y1, this.eb_y1_z8],
			),

			...rect(
				[this.eb_y0_x9, this.eb_y0, this.eb_y0_z9],
				[this.eb_y0_x8, this.eb_y0, this.eb_y0_z8],
				[this.eb_y1_x8, this.eb_y1, this.eb_y1_z8],
				[this.eb_y1_x9, this.eb_y1, this.eb_y1_z9],
				this.skincolor2, null,  null, this.skincolor2,
			),

			...rect(
				[this.eb_y1_x0, this.eb_y1, this.eb_y1_z0],
				[this.eb_y1_x9, this.eb_y1, this.eb_y1_z9],
				[this.eb_y2_x9, this.eb_y2, this.eb_y2_z9],
				[this.eb_y2_x0, this.eb_y2, this.eb_y2_z0],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),
			
			...rect(
				[this.eb_y1_x1, this.eb_y1, this.eb_y1_z1],
				[this.eb_y1_x0, this.eb_y1, this.eb_y1_z0],
				[this.eb_y2_x0, this.eb_y2, this.eb_y2_z0],
				[this.eb_y2_x1, this.eb_y2, this.eb_y2_z1],
				this.skincolor2, this.skincolor2, this.skincolor2,this.skincolor2,
			),
			
			...rect(
				[this.eb_y1_x2, this.eb_y1, this.eb_y1_z2],
				[this.eb_y1_x1, this.eb_y1, this.eb_y1_z1],
				[this.eb_y2_x1, this.eb_y2, this.eb_y2_z1],
				[this.eb_y2_x2, this.eb_y2, this.eb_y2_z2],
				this.skincolor3 ,this.skincolor2, this.skincolor2, this.skincolor2,
			),
			
			...rect(
				[this.eb_y1_x3, this.eb_y1, this.eb_y1_z3],
				[this.eb_y1_x2, this.eb_y1, this.eb_y1_z2],
				[this.eb_y2_x2, this.eb_y2, this.eb_y2_z2],
				[this.eb_y2_x3, this.eb_y2, this.eb_y2_z3],
				this.skincolor2, this.skincolor3 ,this.skincolor2, this.skincolor2,
			),
			
			...rect(
				[this.eb_y1_x4, this.eb_y1, this.eb_y1_z4],
				[this.eb_y1_x3, this.eb_y1, this.eb_y1_z3],
				[this.eb_y2_x3, this.eb_y2, this.eb_y2_z3],
				[this.eb_y2_x4, this.eb_y2, this.eb_y2_z4],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),
			
			...rect(
				[this.eb_y1_x5, this.eb_y1, this.eb_y1_z5],
				[this.eb_y1_x4, this.eb_y1, this.eb_y1_z4],
				[this.eb_y2_x4, this.eb_y2, this.eb_y2_z4],
				[this.eb_y2_x5, this.eb_y2, this.eb_y2_z5],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),
			
			...rect(
				[this.eb_y1_x6, this.eb_y1, this.eb_y1_z6],
				[this.eb_y1_x5, this.eb_y1, this.eb_y1_z5],
				[this.eb_y2_x5, this.eb_y2, this.eb_y2_z5],
				[this.eb_y2_x6, this.eb_y2, this.eb_y2_z6],
				null, this.skincolor2, this.skincolor2, null,
			),
			
			...rect(
				[this.eb_y1_x7, this.eb_y1, this.eb_y1_z7],
				[this.eb_y1_x6, this.eb_y1, this.eb_y1_z6],
				[this.eb_y2_x6, this.eb_y2, this.eb_y2_z6],
				[this.eb_y2_x7, this.eb_y2, this.eb_y2_z7],
			),
			
			...rect(
				[this.eb_y1_x8, this.eb_y1, this.eb_y1_z8],
				[this.eb_y1_x7, this.eb_y1, this.eb_y1_z7],
				[this.eb_y2_x7, this.eb_y2, this.eb_y2_z7],
				[this.eb_y2_x8, this.eb_y2, this.eb_y2_z8],
			),

			...rect(
				[this.eb_y1_x9, this.eb_y1, this.eb_y1_z9],
				[this.eb_y1_x8, this.eb_y1, this.eb_y1_z8],
				[this.eb_y2_x8, this.eb_y2, this.eb_y2_z8],
				[this.eb_y2_x9, this.eb_y2, this.eb_y2_z9],
				this.skincolor2, null, null, this.skincolor2,
			),
		];

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return vertices;
	}

	forearm(u) {

		const vertices = [
			...rect(
				[this.eb_y2_x0, this.fa_y0, this.eb_y2_z0],
				[this.eb_y2_x9, this.fa_y0, this.eb_y2_z9],
				[this.fa_y1_x9, this.fa_y1, this.fa_y1_z9],
				[this.fa_y1_x0, this.fa_y1, this.fa_y1_z0],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y2_x1, this.fa_y0, this.eb_y2_z1],
				[this.eb_y2_x0, this.fa_y0, this.eb_y2_z0],
				[this.fa_y1_x0, this.fa_y1, this.fa_y1_z0],
				[this.fa_y1_x1, this.fa_y1, this.fa_y1_z1],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y2_x2, this.fa_y0, this.eb_y2_z2],
				[this.eb_y2_x1, this.fa_y0, this.eb_y2_z1],
				[this.fa_y1_x1, this.fa_y1, this.fa_y1_z1],
				[this.fa_y1_x2, this.fa_y1, this.fa_y1_z2],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y2_x3, this.fa_y0, this.eb_y2_z3],
				[this.eb_y2_x2, this.fa_y0, this.eb_y2_z2],
				[this.fa_y1_x2, this.fa_y1, this.fa_y1_z2],
				[this.fa_y1_x3, this.fa_y1, this.fa_y1_z3],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y2_x4, this.fa_y0, this.eb_y2_z4],
				[this.eb_y2_x3, this.fa_y0, this.eb_y2_z3],
				[this.fa_y1_x3, this.fa_y1, this.fa_y1_z3],
				[this.fa_y1_x4, this.fa_y1, this.fa_y1_z4],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y2_x5, this.fa_y0, this.eb_y2_z5],
				[this.eb_y2_x4, this.fa_y0, this.eb_y2_z4],
				[this.fa_y1_x4, this.fa_y1, this.fa_y1_z4],
				[this.fa_y1_x5, this.fa_y1, this.fa_y1_z5],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.eb_y2_x6, this.fa_y0, this.eb_y2_z6],
				[this.eb_y2_x5, this.fa_y0, this.eb_y2_z5],
				[this.fa_y1_x5, this.fa_y1, this.fa_y1_z5],
				[this.fa_y1_x6, this.fa_y1, this.fa_y1_z6],
				null, this.skincolor2, this.skincolor2, null,
			),
			
			...rect(
				[this.eb_y2_x7, this.fa_y0, this.eb_y2_z7],
				[this.eb_y2_x6, this.fa_y0, this.eb_y2_z6],
				[this.fa_y1_x6, this.fa_y1, this.fa_y1_z6],
				[this.fa_y1_x7, this.fa_y1, this.fa_y1_z7]
			),
			
			...rect(
				[this.eb_y2_x8, this.fa_y0, this.eb_y2_z8],
				[this.eb_y2_x7, this.fa_y0, this.eb_y2_z7],
				[this.fa_y1_x7, this.fa_y1, this.fa_y1_z7],
				[this.fa_y1_x8, this.fa_y1, this.fa_y1_z8]
			),
			
			...rect(
				[this.eb_y2_x9, this.fa_y0, this.eb_y2_z9],
				[this.eb_y2_x8, this.fa_y0, this.eb_y2_z8],
				[this.fa_y1_x8, this.fa_y1, this.fa_y1_z8],
				[this.fa_y1_x9, this.fa_y1, this.fa_y1_z9],
				this.skincolor2, null, null, this.skincolor2,
			),

			...rect(
				[this.fa_y1_x0, this.fa_y1, this.fa_y1_z0],
				[this.fa_y1_x9, this.fa_y1, this.fa_y1_z9],
				[this.fa_y2_x9, this.fa_y2, this.fa_y2_z9],
				[this.fa_y2_x0, this.fa_y2, this.fa_y2_z0],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),
			
			...rect(
				[this.fa_y1_x1, this.fa_y1, this.fa_y1_z1],
				[this.fa_y1_x0, this.fa_y1, this.fa_y1_z0],
				[this.fa_y2_x0, this.fa_y2, this.fa_y2_z0],
				[this.fa_y2_x1, this.fa_y2, this.fa_y2_z1],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),
			
			...rect(
				[this.fa_y1_x2, this.fa_y1, this.fa_y1_z2],
				[this.fa_y1_x1, this.fa_y1, this.fa_y1_z1],
				[this.fa_y2_x1, this.fa_y2, this.fa_y2_z1],
				[this.fa_y2_x2, this.fa_y2, this.fa_y2_z2],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.fa_y1_x3, this.fa_y1, this.fa_y1_z3],
				[this.fa_y1_x2, this.fa_y1, this.fa_y1_z2],
				[this.fa_y2_x2, this.fa_y2, this.fa_y2_z2],
				[this.fa_y2_x3, this.fa_y2, this.fa_y2_z3],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.fa_y1_x4, this.fa_y1, this.fa_y1_z4],
				[this.fa_y1_x3, this.fa_y1, this.fa_y1_z3],
				[this.fa_y2_x3, this.fa_y2, this.fa_y2_z3],
				[this.fa_y2_x4, this.fa_y2, this.fa_y2_z4],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.fa_y1_x5, this.fa_y1, this.fa_y1_z5],
				[this.fa_y1_x4, this.fa_y1, this.fa_y1_z4],
				[this.fa_y2_x4, this.fa_y2, this.fa_y2_z4],
				[this.fa_y2_x5, this.fa_y2, this.fa_y2_z5],
				this.skincolor2, this.skincolor2, this.skincolor2, this.skincolor2,
			),

			...rect(
				[this.fa_y1_x6, this.fa_y1, this.fa_y1_z6],
				[this.fa_y1_x5, this.fa_y1, this.fa_y1_z5],
				[this.fa_y2_x5, this.fa_y2, this.fa_y2_z5],
				[this.fa_y2_x6, this.fa_y2, this.fa_y2_z6],
				null, this.skincolor2, this.skincolor2, null, 
			),

			...rect(
				[this.fa_y1_x7, this.fa_y1, this.fa_y1_z7],
				[this.fa_y1_x6, this.fa_y1, this.fa_y1_z6],
				[this.fa_y2_x6, this.fa_y2, this.fa_y2_z6],
				[this.fa_y2_x7, this.fa_y2, this.fa_y2_z7],
			),

			...rect(
				[this.fa_y1_x8, this.fa_y1, this.fa_y1_z8],
				[this.fa_y1_x7, this.fa_y1, this.fa_y1_z7],
				[this.fa_y2_x7, this.fa_y2, this.fa_y2_z7],
				[this.fa_y2_x8, this.fa_y2, this.fa_y2_z8],
			),

			...rect(
				[this.fa_y1_x9, this.fa_y1, this.fa_y1_z9],
				[this.fa_y1_x8, this.fa_y1, this.fa_y1_z8],
				[this.fa_y2_x8, this.fa_y2, this.fa_y2_z8],
				[this.fa_y2_x9, this.fa_y2, this.fa_y2_z9],
				this.skincolor2, null, null, this.skincolor2,
			),
		]

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return vertices;
	}

	bufferGeo(color, vertices) {
		const material = new THREE.MeshPhongMaterial({vertexColors: true});

		const positions = [];
		const normals = [];
		const uvs = [];
		const colors = [];
		for (const vertex of vertices) {
			positions.push(...vertex.pos);
			normals.push(...[0, 0, 1]);
			uvs.push(...[0, 0]);

			if (vertex.clr) {
				colors.push(...vertex.clr);
			} else {
				colors.push(...color);
			}
		}

		const geometry = new THREE.BufferGeometry();
		const positionNumComponents = 3;
		const normalNumComponents = 3;
		const uvNumComponents = 2;
		const colorNumComponents = 3;
		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(
				new Float32Array(positions),
				positionNumComponents
			)
		);
		geometry.setAttribute(
			"normal",
			new THREE.BufferAttribute(
				new Float32Array(normals),
				normalNumComponents
			)
		);
		geometry.setAttribute(
			"uv",
			new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
		);
		geometry.setAttribute(
			"color",
			new THREE.BufferAttribute(new Uint8Array(colors), colorNumComponents, true)
		);

		return new THREE.Mesh(geometry, material);
	}
}
