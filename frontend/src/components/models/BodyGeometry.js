import * as THREE from "three";

export class BodyGeometry {
	constructor() {
		/**** positions on the body */
		// shoulder to body x
		this.sbx = 1.2;
		// deltoid farx, distance away from body
		this.dd_fx = -2.2;
		// upper deltoid far z positive
		this.udd_fzp = 1.3;

		// bicep far x negative, away from body
		this.bfxg = -1.66;
		// bicep far x negative, close from body
		this.bp_fxp = 1.39;
		// bicep far z positive
		this.bfzp = 1.46;
		// upper bicep far y negative
		this.ubp_fary = -6.0;
		// lower bicep far y negative
		this.lbp_fary = -9;
		// lower bicep end positove z
		this.lbp_pz = 1;
	}

	deltoid(u) {
		const vertices = [
			// top of shoulder outside

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },

			// top of shoulder inside

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, 0.1, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [this.sbx, 0.1, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [this.sbx, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },

			// upper deltoid outside

			{ pos: [0, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -1.4, this.udd_fzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, this.udd_fzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, this.udd_fzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, this.udd_fzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },

			// upper deltoid inside, positove z

			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -1.4, this.udd_fzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, this.udd_fzp], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.sbx, -1.4, this.udd_fzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [this.sbx, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },

			// upper deltoid inside, negative z

			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -1.4, -this.udd_fzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, -this.udd_fzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.sbx, -1.4, -this.udd_fzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			{ pos: [0, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },

			// middle line of upper deltoid

			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },

			// lower deltoid
			{ pos: [0, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },

			// lower deltoid middle line

			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
		];

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return this.bufferGeo(0xe0ac69, vertices);
	}

	bicep(u) {
		const vertices = [
			//  upper bicep, negative x, away from body
			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, this.ubp_fary, this.bfzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, this.ubp_fary, this.bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [-1, this.ubp_fary, this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			{
				pos: [-1, this.ubp_fary, this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, this.ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, this.ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.bfxg, this.ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			//  upper bicep, positive x, close to body

			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, this.ubp_fary, this.bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, this.ubp_fary, this.bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, this.ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, this.ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.bp_fxp, this.ubp_fary, 0],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.bp_fxp, this.ubp_fary, 0],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [this.bp_fxp, -2.8, 0], norm: [0, 0, 1], uv: [0, 0] },

			//  upper bicep, positive x, close to body, middle line

			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.bp_fxp, -2.8, 0], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.bp_fxp, this.ubp_fary, 0],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.bp_fxp, this.ubp_fary, 0],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [1, this.ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{
				pos: [0, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, this.ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [0, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.sbx, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },

			// upper bicep middle line

			{ pos: [this.bfxg, this.ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, this.ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{
				pos: [-1, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [-1.4, this.ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{
				pos: [0, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{
				pos: [-1, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [0, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			// lower bicep

			{ pos: [0, this.ubp_fary, this.bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [-1, this.ubp_fary, this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{
				pos: [0, this.lbp_fary, this.lbp_pz],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			{
				pos: [0, this.lbp_fary, this.lbp_pz],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{
				pos: [-1, this.ubp_fary, this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [-1, this.lbp_fary, 1], norm: [0, 0, 1], uv: [0, 0] },

			{
				pos: [-1, this.ubp_fary, this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [-1.4, this.ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, this.lbp_fary, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, this.lbp_fary, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.lbp_fary, 0.6], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, this.lbp_fary, 0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.bfxg, this.ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, this.lbp_fary, 0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.bfxg, this.ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.lbp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			// lower bicep, positive x, positive z, close to body

			{ pos: [0, this.ubp_fary, this.bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [0, this.lbp_fary, this.lbp_pz],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [1, this.ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },

			{
				pos: [0, this.lbp_fary, this.lbp_pz],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [1, this.lbp_fary, 0.4], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, this.ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, this.lbp_fary, 0.4], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.bp_fxp, this.ubp_fary, 0],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [1, this.ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, this.lbp_fary, 0.4], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, this.lbp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.bp_fxp, this.ubp_fary, 0],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			// lower bicep, positive x, negative z, close to body

			{ pos: [1, this.lbp_fary, -0.4], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.bp_fxp, this.ubp_fary, 0],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [1, this.lbp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, this.lbp_fary, -0.4], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, this.ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [this.bp_fxp, this.ubp_fary, 0],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			{
				pos: [0, this.lbp_fary, -this.lbp_pz],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [1, this.ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, this.lbp_fary, -0.4], norm: [0, 0, 1], uv: [0, 0] },

			{
				pos: [0, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [1, this.ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [0, this.lbp_fary, -this.lbp_pz],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			// lower bicep middle line

			{ pos: [-1.4, this.lbp_fary, -0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.lbp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.bfxg, this.ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, this.lbp_fary, -0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [this.bfxg, this.ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, this.lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.lbp_fary, -0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },

			{
				pos: [-1, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [-1, this.lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, this.ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, this.lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, this.lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [-1, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},

			{
				pos: [0, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
			{ pos: [0, this.lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{
				pos: [-1, this.ubp_fary, -this.bfzp],
				norm: [0, 0, 1],
				uv: [0, 0],
			},
		];

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return this.bufferGeo(0xf1c27d, vertices);
	}

	bufferGeo(color, vertices) {
		const material = new THREE.MeshPhongMaterial({
			color: color,
			// vertexColors: true,
		});
		// const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

		const positions = [];
		const normals = [];
		const uvs = [];
		// const colors = [];
		for (const vertex of vertices) {
			positions.push(...vertex.pos);
			normals.push(...vertex.norm);
			uvs.push(...vertex.uv);
			// colors.push(...vertex.clr);
		}

		const geometry = new THREE.BufferGeometry();
		const positionNumComponents = 3;
		const normalNumComponents = 3;
		const uvNumComponents = 2;
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
		// geometry.setAttribute(
		// 	"color",
		// 	new THREE.BufferAttribute(new Float32Array(colors), uvNumComponents)
		// );

		return new THREE.Mesh(geometry, material);
	}
}
