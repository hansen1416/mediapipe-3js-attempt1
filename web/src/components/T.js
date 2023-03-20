import * as THREE from "three";

export default class T {
	/**
	 * limbs geometry combined 3d human figure
	 */

	static limbs = [
		"abs",
		"chest",
		"neck",
		"head",
		"shoulder_l",
		"shoulder_r",
		"upperarm_l",
		"upperarm_r",
		"elbow_l",
		"elbow_r",
		"lowerarm_l",
		"lowerarm_r",
		"wrist_l",
		"wrist_r",
		"hand_l",
		"hand_r",
		"hip_l",
		"hip_r",
		"thigh_l",
		"thigh_r",
		"knee_l",
		"knee_r",
		"calf_l",
		"calf_r",
		"ankle_l",
		"ankle_r",
		"foot_l",
		"foot_r",
		"pelma_l",
		"pelma_r",
	];

	pos = {
		abs: {
			x: 0,
			y: 73.06646537780762,
			z: 2.173459053039551,
		},
		chest: {
			x: 0,
			y: 96.37579345703125,
			z: 1.555971384048462,
		},
		neck: {
			x: -2.384185791015625e-7,
			y: 108.9151611328125,
			z: 1.2082147598266602,
		},
		head: {
			x: 0,
			y: 115.1942367553711,
			z: 2.442631244659424,
		},
		foot_l: {
			x: 6.038201689720154,
			y: 4.189789369702339,
			z: 5.3377227783203125,
		},
		foot_r: {
			x: -6.038201689720154,
			y: 4.189789369702339,
			z: 5.3377227783203125,
		},
		calf_l: {
			x: 6.078888535499573,
			y: 24.266510009765625,
			z: 1.186724066734314,
		},
		calf_r: {
			x: -6.078888535499573,
			y: 24.266510009765625,
			z: 1.186724066734314,
		},
		lowerarm_l: {
			x: 34.57040786743164,
			y: 98.3515853881836,
			z: -0.5303339958190918,
		},
		lowerarm_r: {
			x: -34.57040786743164,
			y: 98.3515853881836,
			z: -0.5303339958190918,
		},
		pelma_l: {
			x: 5.950271844863892,
			y: 2.106816291809082,
			z: 9.454838275909424,
		},
		pelma_r: {
			x: -5.950271844863892,
			y: 2.106816291809082,
			z: 9.454838275909424,
		},
		thigh_l: {
			x: 6.465143918991089,
			y: 52.77687644958496,
			z: 1.2393369674682617,
		},
		thigh_r: {
			x: -6.465143918991089,
			y: 52.77687644958496,
			z: 1.2393369674682617,
		},
		knee_l: {
			x: 5.950271725654602,
			y: 39.12459182739258,
			z: 1.4469028115272522,
		},
		knee_r: {
			x: -5.950271725654602,
			y: 39.12459182739258,
			z: 1.4469028115272522,
		},
		wrist_l: {
			x: 42.58299446105957,
			y: 97.59692001342773,
			z: 0.7862309217453003,
		},
		wrist_r: {
			x: -42.58299446105957,
			y: 97.59692001342773,
			z: 0.7862309217453003,
		},
		shoulder_l: {
			x: 10.224750518798828,
			y: 99.86847686767578,
			z: 1.8163499236106873,
		},
		shoulder_r: {
			x: -10.224750518798828,
			y: 99.86847686767578,
			z: 1.8163499236106873,
		},
		elbow_l: {
			x: 26.771096229553223,
			y: 98.29524612426758,
			z: -0.9946861267089844,
		},
		elbow_r: {
			x: -26.771096229553223,
			y: 98.29524612426758,
			z: -0.9946861267089844,
		},
		hand_l: {
			x: 49.42721748352051,
			y: 97.63338470458984,
			z: 3.562742054462433,
		},
		hand_r: {
			x: -49.42721748352051,
			y: 97.63338470458984,
			z: 3.562742054462433,
		},
		upperarm_l: {
			x: 18.69175386428833,
			y: 99.65556335449219,
			z: 0.5235534906387329,
		},
		upperarm_r: {
			x: -18.69175386428833,
			y: 99.65556335449219,
			z: 0.5235534906387329,
		},
		hip_l: {
			x: 5.822864592075348,
			y: 66.59577178955078,
			z: 1.9783098697662354,
		},
		hip_r: {
			x: -5.822864592075348,
			y: 66.59577178955078,
			z: 1.9783098697662354,
		},
		ankle_l: {
			x: 5.950271844863892,
			y: 8.869707345962524,
			z: -4.76837158203125e-7,
		},
		ankle_r: {
			x: -5.950271844863892,
			y: 8.869707345962524,
			z: -4.76837158203125e-7,
		},
	};

	constructor(geometry) {
		// color of material
		this.color = 0x44aa88;
		// opacity of material, when pose score is lower/higher then 0.5
		this.invisible_opacity = 0.5;
		this.visible_opacity = 0.8;

		this.body = new THREE.Group();

		this.body.position.set(this.pos.abs.x, -this.pos.abs.y, this.pos.abs.z);

		for (let name in geometry) {
			const mesh = new THREE.Mesh(
				geometry[name],
				new THREE.MeshLambertMaterial({
					color: 0x12c2e9,
					transparent: true,
					opacity: 0.1,
				})
			);

			mesh.position.set(
				this.pos[name].x,
				this.pos[name].y,
				this.pos[name].z
			);

			this.body.add(mesh);
		}
	}

	init() {
		/**
		 * initialize body parts
		 */

		// for (let name of T.limbs) {
		// 	this[name].group.name = name;

		// 	this.body.add(this[name].group);

		// 	this[name].group.add(this[name].mesh);

		// 	const pos = this[name].position();

		// 	this[name].group.position.set(pos.x, pos.y, pos.z);

		// 	this[name].mesh.position.set(
		// 		this[name].mesh_position.x,
		// 		this[name].mesh_position.y,
		// 		this[name].mesh_position.z
		// 	);
		// }

		return this.body;
	}
}
