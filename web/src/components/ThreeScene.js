import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class ThreeScene {
	constructor(canvas, scene_width, scene_height) {
		this.scene = new THREE.Scene();

		this.camera = new THREE.OrthographicCamera(
			scene_width / -2, // left
			scene_width / 2, // right
			scene_height / 2, // top
			scene_height / -2, // bottom
			0.1, // near
			scene_width * 2 // far
		);

		this.camera.position.set(0, 200, -scene_width);

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.4);
			dlight.position.set(0, 10, 10);
			this.scene.add(dlight);
			// env light
			this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
		}

		this.renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
			antialias: true,
		});

		this.renderer.toneMappingExposure = 0.5;

		this.controls = new OrbitControls(this.camera, canvas);

		this.renderer.setSize(scene_width, scene_height);
	}

	onFrameUpdate() {
		this.controls.update();

		this.renderer.render(this.scene, this.camera);
	}
}
