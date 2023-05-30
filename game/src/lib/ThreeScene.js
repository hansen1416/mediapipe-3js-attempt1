import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class ThreeScene {
	constructor(canvas, width, height) {
		this.scene = new THREE.Scene();

		this.scene.add(new THREE.AxesHelper(1));

		this.camera = new THREE.OrthographicCamera(
			width / -2, // left
			width / 2, // right
			height / 2, // top
			height / -2, // bottom
			0.1, // near
			width * 2 // far
		);

		this.camera.position.set(0, 10, -width);
		this.camera.zoom = 160; // zoom in by 50%

		// far angle for throw testing
		// this.camera.zoom = 30; // zoom in by 50%
		// this.camera.position.set(600, 600, -width);
		// far angle for throw testing

		this.camera.zoom = 60; // zoom in by 50%
		this.camera.position.set(0, 300, -width);

		this.camera.updateProjectionMatrix(); // update the camera's projection matrix

		{
			// mimic the sun light
			const dlight = new THREE.SpotLight(0xffffff, 0.7);
			dlight.position.set(0, 30, 0);
			dlight.castShadow = true;
			this.scene.add(dlight);
			// env light
			this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
		}

		this.renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
			antialias: true,
		});

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.BasicShadowMap; //THREE.PCFSoftShadowMap;
		this.renderer.toneMappingExposure = 0.5;

		this.controls = new OrbitControls(this.camera, canvas);

		this.renderer.setSize(width, height);
	}

	onFrameUpdate() {
		this.controls.update();

		this.renderer.render(this.scene, this.camera);
	}
}
