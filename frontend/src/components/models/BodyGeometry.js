import * as THREE from "three";

export class BodyGeometry {
	constructor() {
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

		return this.bufferGeo(0xe0ac69, vertices);
	}

	bicep(u) {
		const vertices = [
			//  upper bicep, negative x, away from body
			{ pos: [0, -2.2, 1.1] },
			{ pos: [-1, -2.8, 1.0] },
			{ pos: [0, this.u_bp_y, this.u_bp_y1_zn2] },

			{ pos: [0, this.u_bp_y, this.u_bp_y1_zn2] },
			{ pos: [-1, -2.8, 1.0] },
			{ pos: [-1, this.u_bp_y, this.u_bp_y1_zn2] },

			{ pos: [-1, this.u_bp_y, this.u_bp_y1_zn2] },
			{ pos: [-1, -2.8, 1.0] },
			{ pos: [-1.4, this.u_bp_y, 1.2] },

			{ pos: [-1.4, this.u_bp_y, 1.2] },
			{ pos: [-1, -2.8, 1.0] },
			{ pos: [-1.2, -3.6, 0] },

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

			{ pos: [0, this.u_bp_y, this.u_bp_y1_zn2] },
			{ pos: [this.l_bp_y1_xn4, this.u_bp_y, this.u_bp_y1_zn2] },
			{ pos: [0, this.l_bp_y1, this.l_bp_y1_zp2] },

			{ pos: [0, this.l_bp_y1, this.l_bp_y1_zp2] },
			{ pos: [this.l_bp_y1_xn4, this.u_bp_y, this.u_bp_y1_zn2] },
			{ pos: [this.l_bp_y1_xn4, this.l_bp_y1, this.l_bp_y1_zp1] },

			{ pos: [this.l_bp_y1_xn4, this.u_bp_y, this.u_bp_y1_zn2] },
			{ pos: [-1.4, this.u_bp_y, 1.2] },
			{ pos: [this.l_bp_y1_xn4, this.l_bp_y1, this.l_bp_y1_zp1] },

			{ pos: [this.l_bp_y1_xn4, this.l_bp_y1, this.l_bp_y1_zp1] },
			{ pos: [-1.4, this.u_bp_y, 1.2] },
			{ pos: [this.l_bp_y1_xn2, this.l_bp_y1, this.l_bp_y1_zp3] },

			{ pos: [this.l_bp_y1_xn2, this.l_bp_y1, this.l_bp_y1_zp3] },
			{ pos: [-1.4, this.u_bp_y, 1.2] },
			{ pos: [this.bp_xa, this.u_bp_y, 0] },

			{ pos: [this.l_bp_y1_xn2, this.l_bp_y1, this.l_bp_y1_zp3] },
			{ pos: [this.bp_xa, this.u_bp_y, 0] },
			{ pos: [this.l_bp_y1_xn0, this.l_bp_y1, 0] },

			// lower bicep, positive x, positive z, close to body

			{ pos: [0, this.u_bp_y, this.u_bp_y1_zn2] },
			{ pos: [0, this.l_bp_y1, this.l_bp_y1_zp2] },
			{ pos: [1, this.u_bp_y, 1.0] },

			{ pos: [0, this.l_bp_y1, this.l_bp_y1_zp2] },
			{ pos: [1, this.l_bp_y1, this.l_bp_y1_zp4] },
			{ pos: [1, this.u_bp_y, 1] },

			{ pos: [1, this.l_bp_y1, this.l_bp_y1_zp4] },
			{ pos: [this.bp_xt, this.u_bp_y, 0] },
			{ pos: [1, this.u_bp_y, 1.0] },

			{ pos: [1, this.l_bp_y1, this.l_bp_y1_zp4] },
			{ pos: [1, this.l_bp_y1, 0] },
			{ pos: [this.bp_xt, this.u_bp_y, 0] },

			// lower bicep, positive x, negative z, close to body

			{ pos: [this.l_bp_y1_xp1, this.l_bp_y1, this.l_bp_y1_zn4] },
			{ pos: [this.bp_xt, this.u_bp_y, 0] },
			{ pos: [this.l_bp_y1_xp0, this.l_bp_y1, 0] },

			{ pos: [1, this.l_bp_y1, this.l_bp_y1_zn4] },
			{ pos: [1, this.u_bp_y, -1.0] },
			{ pos: [this.bp_xt, this.u_bp_y, 0] },

			{ pos: [0, this.l_bp_y1, -this.l_bp_y1_zp2] },
			{ pos: [1, this.u_bp_y, -1.0] },
			{ pos: [1, this.l_bp_y1, this.l_bp_y1_zn4] },

			{ pos: [0, this.u_bp_y, -this.u_bp_y1_zn2] },
			{ pos: [1, this.u_bp_y, -1.0] },
			{ pos: [0, this.l_bp_y1, -this.l_bp_y1_zp2] },

			// lower bicep middle line

			{ pos: [-1.4, this.l_bp_y1, -0.6] },
			{ pos: [-1.4, this.l_bp_y1, 0] },
			{ pos: [this.bp_xa, this.u_bp_y, 0] },

			{ pos: [-1.4, this.l_bp_y1, -0.6] },
			{ pos: [this.bp_xa, this.u_bp_y, 0] },
			{ pos: [-1.4, this.u_bp_y, -1.2] },

			{ pos: [-1, this.l_bp_y1, -1] },
			{ pos: [-1.4, this.l_bp_y1, -0.6] },
			{ pos: [-1.4, this.u_bp_y, -1.2] },

			{ pos: [-1, this.u_bp_y, -this.u_bp_y1_zn2] },
			{ pos: [-1, this.l_bp_y1, -1] },
			{ pos: [-1.4, this.u_bp_y, -1.2] },

			{ pos: [0, this.l_bp_y1, -1] },
			{ pos: [-1, this.l_bp_y1, -1] },
			{ pos: [-1, this.u_bp_y, -this.u_bp_y1_zn2] },

			{ pos: [0, this.u_bp_y, -this.u_bp_y1_zn2] },
			{ pos: [0, this.l_bp_y1, -1] },
			{ pos: [-1, this.u_bp_y, -this.u_bp_y1_zn2] },
		];

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return this.bufferGeo(0xf1c27d, vertices);
	}

	elbow(u) {
		const vertices = [
			// lower bicep middle line

			{ pos: [0, this.l_bp_y1, -0.6] },
			{ pos: [0, this.l_bp_y1, 0] },
			{
				pos: [this.bp_xa, this.u_bp_y, 0],
			},
		];

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return this.bufferGeo(0xf1ff7d, vertices);
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
			// normals.push(...vertex.norm);
			// uvs.push(...vertex.uv);
			// colors.push(...vertex.clr);
			normals.push(...[0, 0, 1]);
			uvs.push(...[0, 0]);
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
