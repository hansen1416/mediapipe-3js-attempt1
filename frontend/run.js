const THREE = require("three");
const pose = require("@mediapipe/pose");

// console.log(new THREE.Scene())

// a = new THREE.Vector3(0, -1, 0).normalize();
// b = new THREE.Vector3(1, -1, 1).normalize();

// // console.log(a,b)

// var quaternion = new THREE.Quaternion(); // create one and reuse it

// quaternion.setFromUnitVectors( a, b );

// console.log(quaternion)

// var matrix = new THREE.Matrix4(); // create one and reuse it

// matrix.makeRotationFromQuaternion( quaternion );

// console.log(matrix)

// var rotation = new THREE.Euler().setFromQuaternion( quaternion, 'XYZ' );

// console.log(rotation)

// a.applyQuaternion( quaternion );

// console.log(a, b)

const landmark = [{
	'x': 0.001138780266046524,
	'y': -0.5836557745933533,
	'z': -0.3552223742008209,
	'visibility': 0.9999723434448242,
  }
  , {
	'x': 0.023991238325834274,
	'y': -0.6008862257003784,
	'z': -0.34516867995262146,
	'visibility': 0.9999486207962036,
  }
  , {
	'x': 0.026923051103949547,
	'y': -0.6010202765464783,
	'z': -0.33300113677978516,
	'visibility': 0.9999359846115112,
  }
  , {
	'x': 0.024934783577919006,
	'y': -0.6009237766265869,
	'z': -0.33754369616508484,
	'visibility': 0.999956488609314,
  }
  , {
	'x': -0.0023639127612113953,
	'y': -0.6128901243209839,
	'z': -0.3586239516735077,
	'visibility': 0.9999579191207886,
  }
  , {
	'x': -0.00016408413648605347,
	'y': -0.6109399199485779,
	'z': -0.3724570572376251,
	'visibility': 0.9999606609344482,
  }
  , {
	'x': 0.0025185476988554,
	'y': -0.6014564037322998,
	'z': -0.3511975407600403,
	'visibility': 0.999968409538269,
  }
  , {
	'x': 0.08609133958816528,
	'y': -0.5762432813644409,
	'z': -0.22219401597976685,
	'visibility': 0.9999526739120483,
  }
  , {
	'x': -0.06640944629907608,
	'y': -0.5529749989509583,
	'z': -0.22833864390850067,
	'visibility': 0.9998522996902466,
  }
  , {
	'x': 0.0353272408246994,
	'y': -0.5687260627746582,
	'z': -0.299903005361557,
	'visibility': 0.99996018409729,
  }
  , {
	'x': -0.006440682336688042,
	'y': -0.539596438407898,
	'z': -0.330828994512558,
	'visibility': 0.9999526739120483,
  }
  , {
	'x': 0.1605539470911026,
	'y': -0.418576717376709,
	'z': -0.056003667414188385,
	'visibility': 0.9999760389328003,
  }
  , {
	'x': -0.14052774012088776,
	'y': -0.48984232544898987,
	'z': -0.04721743240952492,
	'visibility': 0.9999154806137085,
  }
  , {
	'x': 0.2076983004808426,
	'y': -0.22599554061889648,
	'z': -0.04640554264187813,
	'visibility': 0.9651142358779907,
  }
  , {
	'x': -0.17462222278118134,
	'y': -0.2139439880847931,
	'z': -0.08951211720705032,
	'visibility': 0.9418777227401733,
  }
  , {
	'x': 0.10310289263725281,
	'y': -0.10033926367759705,
	'z': -0.1272178590297699,
	'visibility': 0.9567005634307861,
  }
  , {
	'x': -0.06350960582494736,
	'y': -0.10578557103872299,
	'z': -0.22068017721176147,
	'visibility': 0.834118664264679,
  }
  , {
	'x': 0.055562861263751984,
	'y': -0.07322559505701065,
	'z': -0.15081875026226044,
	'visibility': 0.9415390491485596,
  }
  , {
	'x': 0.003360138274729252,
	'y': -0.07974425703287125,
	'z': -0.29132014513015747,
	'visibility': 0.7760540246963501,
  }
  , {
	'x': 0.024840181693434715,
	'y': -0.10009435564279556,
	'z': -0.16993528604507446,
	'visibility': 0.9461807608604431,
  }
  , {
	'x': 0.049731455743312836,
	'y': -0.13997718691825867,
	'z': -0.29865163564682007,
	'visibility': 0.7823636531829834,
  }
  , {
	'x': 0.08611533790826797,
	'y': -0.08613282442092896,
	'z': -0.13658541440963745,
	'visibility': 0.9098016619682312,
  }
  , {
	'x': -0.03245265409350395,
	'y': -0.1203635036945343,
	'z': -0.235219806432724,
	'visibility': 0.6879169940948486,
  }
  , {
	'x': 0.09504186362028122,
	'y': 0.0011611331719905138,
	'z': 0.03452887758612633,
	'visibility': 0.9999814033508301,
  }
  , {
	'x': -0.0933273658156395,
	'y': -0.003946442157030106,
	'z': -0.031513411551713943,
	'visibility': 0.9999771118164062,
  }
  , {
	'x': 0.1413552463054657,
	'y': 0.43907803297042847,
	'z': 0.0077600060030817986,
	'visibility': 0.9831885695457458,
  }
  , {
	'x': -0.10622115433216095,
	'y': 0.3552592992782593,
	'z': -0.017258351668715477,
	'visibility': 0.9773833751678467,
  }
  , {
	'x': 0.18864764273166656,
	'y': 0.7813813090324402,
	'z': 0.14526984095573425,
	'visibility': 0.9882174134254456,
  }
  , {
	'x': -0.1936672180891037,
	'y': 0.7567495703697205,
	'z': 0.1382042020559311,
	'visibility': 0.9908571839332581,
  }
  , {
	'x': 0.17105448246002197,
	'y': 0.8168891072273254,
	'z': 0.16220493614673615,
	'visibility': 0.8446321487426758,
  }
  , {
	'x': -0.20298883318901062,
	'y': 0.7919691801071167,
	'z': 0.11244527995586395,
	'visibility': 0.8651900291442871,
  }
  , {
	'x': 0.18950873613357544,
	'y': 0.843349814414978,
	'z': 0.07885908335447311,
	'visibility': 0.9844271540641785,
  }
  , {
	'x': -0.23892202973365784,
	'y': 0.7928145527839661,
	'z': 0.004229036625474691,
	'visibility': 0.9839996695518494,
  }]

const arms = { 
	LEFT_SHOULDER: 11,
	RIGHT_SHOULDER: 12,
	LEFT_ELBOW: 13,
	RIGHT_ELBOW: 14,
	LEFT_WRIST: 15,
	RIGHT_WRIST: 16,
}

function quaternionFromVectors(a, b) {

	const quaternion = new THREE.Quaternion();

	quaternion.setFromUnitVectors(a.normalize(), b.normalize());

	return quaternion
}

const pos = {}

for (let l in arms) {
	pos[l] = landmark[arms[l]]
}

const left_bigarm = new THREE.Vector3(pos['LEFT_ELBOW'].x - pos['LEFT_SHOULDER'].x, 
pos['LEFT_SHOULDER'].y - pos['LEFT_ELBOW'].y,
pos['LEFT_ELBOW'].z - pos['LEFT_SHOULDER'].z).normalize()

const left_bigarm_idle = new THREE.Vector3(0,-1,0).normalize()

const quaternion = quaternionFromVectors(left_bigarm_idle, left_bigarm)

// var rotation = new THREE.Euler().setFromQuaternion( quaternion, 'XYZ' );

// console.log(rotation)

console.log(left_bigarm_idle, left_bigarm)

left_bigarm_idle.applyQuaternion(quaternion);

console.log(left_bigarm_idle)

