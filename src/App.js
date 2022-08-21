import logo from "./logo.svg";
import "./App.css";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet/dist/leaflet-src";
// import "./Bing.js";
// import "./leaflet.ChineseTmsProviders.js";
import "proj4leaflet";
import "./leaflet-tilelayer-wmts-src.js";

let HOME_MAP = null;

// function getMapObject(divId) {
// 	let smartMap = L.map(divId, {
// 		preferCanvas: true,
// 		attributionControl: false,
// 		zoomSnap: 1,
// 	});
// 	{
// 		let locationsArray = [];
// 		smartMap.on("contextmenu", (e) => {
// 			let { lng: x, lat: y } = e.latlng;
// 			locationsArray.push([x, y]);
// 			// console.log([y, x]);
// 		});
// 		global.myArrXy = locationsArray;
// 	}
// 	let baseLayers = getBaseLayers();
// 	smartMap.addLayer(baseLayers.Chinese);
// 	smartMap.setView([30.022234854301942, 120.88861297401787], 13.84);
// 	return smartMap;
// }

// function getBaseLayers() {
// 	return {
// 		Default: L.bingLayer({
// 			key: process.env.REACT_APP_BING_MAP_KEY,
// 			imagerySet: process.env.REACT_APP_BING_MAP_IMAGERY_SET_CANVAS_DARK,
// 			culture: "en-US",
// 			style: process.env.REACT_APP_BING_MAP_STYLE_DARK,
// 		}),
// 		Chinese: L.bingLayer({
// 			key: process.env.REACT_APP_BING_MAP_KEY,
// 			imagerySet: process.env.REACT_APP_BING_MAP_IMAGERY_SET_CANVAS_DARK,
// 			culture: "zh-CN",
// 			style: process.env.REACT_APP_BING_MAP_STYLE_DARK,
// 		}),
// 		Satelite: L.tileLayer.chinaProvider("GaoDe.Satellite.Map", {
// 			//maxZoom: 18,
// 			minZoom: 5,
// 		}),
// 		BlackRiver: L.bingLayer({
// 			key: process.env.REACT_APP_BING_MAP_KEY,
// 			imagerySet: process.env.REACT_APP_BING_MAP_IMAGERY_SET_CANVAS_DARK,
// 			culture: "en-US",
// 			style: process.env.REACT_APP_BING_MAP_STYLE_BLACK_RIVER,
// 		}),
// 		BlackRiverChinese: L.bingLayer({
// 			key: process.env.REACT_APP_BING_MAP_KEY,
// 			imagerySet: process.env.REACT_APP_BING_MAP_IMAGERY_SET_CANVAS_DARK,
// 			culture: "zh-CN",
// 			style: process.env.REACT_APP_BING_MAP_STYLE_BLACK_RIVER,
// 		}),
// 	};
// }

function getCRS() {
	// 定义坐标系
	const CRS_4549 = new L.Proj.CRS(
		"EPSG:4549",
		"+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs", // EPSG:4490的PROJ.4描述
		{
			resolutions: [
				156367.7919628329, // 0
				78183.89598141646,
				39091.94799070823,
				19545.973995354114,
				9772.986997677057,
				4886.4934988385285,
				2443.2467494192642,
				1221.6233747096321,
				610.8116873548161,
				305.40584367740803,
				152.70292183870401,
				76.35146091935201,
				38.175730459676004,
				19.087865229838002,
				9.543932614919001,
				4.7719663074595005,
				2.3859831537297502,
				1.1929915768648751,
				0.5964957884324376,
				0.2982478942162188, // 19
			],
		}
	);

	return CRS_4549;
}

const tk = "ccaec6b50eb841569ef8680f4b9118f5";

function App() {
	useEffect(() => {
		const map = L.map("home-map", {
			layers: [
				L.tileLayer(
					"http://t0.tianditu.gov.cn/vec_w/wmts?" +
						"SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
						"&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" +
						tk //tk: 问前端主管要
				),
			],
			crs: getCRS(),
			center: [580147.91, 13321376.71],
			zoom: 6,
			preferCanvas: true,
			attributionControl: false,
			zoomSnap: 1,
		});
		// ————————————————
		// 版权声明：本文为CSDN博主「qq_46302247」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
		// 原文链接：https://blog.csdn.net/qq_46302247/article/details/124734031
	}, []);

	/**====================== */

	// useEffect(() => {
	// 	const tk = "ccaec6b50eb841569ef8680f4b9118f5";

	// 	var url =
	// 		"http://t0.tianditu.cn/vec_c/wmts?layer=vec&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&tk=" +
	// 		tk;
	// 	var url1 =
	// 		"http://t0.tianditu.gov.cn/cva_c/wmts?layer=cva&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&tk=" +
	// 		tk;

	// 	url = "http://t0.tianditu.gov.cn/vec_c/wmts?tk=" + tk;
	// 	url = "http://t0.tianditu.gov.cn/vec_w/wmts?tk" + tk;

	// 	var emap = new L.TileLayer.WMTS(url, {
	// 		tileSize: 256,
	// 		layer: "vec",
	// 		style: "default",
	// 		tilematrixSet: "c",
	// 		format: "tile",
	// 		attribution:
	// 			"<a href='https://github.com/mylen/leaflet.TileLayer.WMTS'>GitHub</a>&copy; <a href='http://www.ign.fr'>IGN</a>",
	// 	});

	// 	// console.log(emap);

	// 	var map = L.map("home-map", {
	// 		crs: L.CRS.EPSG4326,
	// 		measureControl: true,
	// 		center: { lon: 118.615, lat: 32 },
	// 		zoom: 18,
	// 	});
	// 	map.addLayer(emap);
	// }, []);

	/**====================== */

	// useEffect(() => {
	// 	// HOME_MAP = getMapObject("home-map");
	// 	const CRS_4549 = getCRS();

	// 	// 经纬度单位，注意纬度在前
	// 	let center = [31.3456789123, 121.789876543];
	// 	// 地图对象
	// 	const map = L.map("home-map", {
	// 		center: center,
	// 		zoom: 6,
	// 		crs: CRS_4549, // 定义的坐标系
	// 	});

	// 	// L.getDefaultMatrix;

	// 	const tk = "ccaec6b50eb841569ef8680f4b9118f5";

	// 	// 服务是2000坐标系
	// 	L.tileLayer
	// 		.wms("http://t0.tianditu.gov.cn/vec_c/wmts?tk=" + tk, {
	// 			layers: "060601", // 资源名称
	// 			format: "image/png",
	// 			transparent: true,
	// 		})
	// 		.addTo(map);
	// 	// 画一个圆
	// 	L.circle(center, { radius: 100000 }).addTo(map);
	// 	// 地理点单位转化
	// 	let center_latLng = L.latLng(center);
	// 	// 转平面坐标描述的点
	// 	let center_latLng_project = CRS_4549.project(center_latLng);
	// 	// 输出只：L.Point {x: 670333.9079398193, y: 3470684.886947584}
	// 	console.log(center_latLng_project);
	// 	// 转经纬度描述的点
	// 	let center_latLng_project_unproject = CRS_4549.unproject(
	// 		center_latLng_project
	// 	);
	// 	// 输出值：L.LatLng {lat: 31.345678912291856, lng: 121.78987654308136}
	// 	// 有些点下会只有7位左右的小数和原数据匹配，渲染已经满足。
	// 	console.log(center_latLng_project_unproject);

	// 	// 渲染geojson,投影坐标描述
	// 	let geojson = {
	// 		type: "FeatureCollection",
	// 		features: [
	// 			{
	// 				type: "Feature",
	// 				id: "polygon.1",
	// 				geometry: {
	// 					type: "MultiPolygon",
	// 					coordinates: [
	// 						[
	// 							[
	// 								[550333.9079398193, 3470684.886947584],
	// 								[460333.9079398193, 3070684.886947584],
	// 								[348333.9079398193, 2970684.886947584],
	// 								[550333.9079398193, 3470684.886947584],
	// 							],
	// 						],
	// 					],
	// 				},
	// 				properties: { name: "rect" },
	// 			},
	// 		],
	// 		crs: {
	// 			type: "name",
	// 			properties: { name: "EPSG:4549" }, // EPSG:4549
	// 		},
	// 	};

	// 	// L.Proj.GeoJSON继承于L.GeoJSON，可调样式
	// 	L.Proj.geoJson(geojson, {
	// 		style: {
	// 			color: "#ff0000",
	// 			weight: 5,
	// 			opacity: 0.65,
	// 		},
	// 	}).addTo(map);

	// 	return () => {
	// 		// if (HOME_MAP) {
	// 		// 	HOME_MAP.remove();
	// 		// 	// HOME_MAP = null;
	// 		// }
	// 	};
	// }, []);

	return (
		<div className="App">
			<header className="App-header">
				<div>
					<div id="home-map" className={"homeMap"}></div>
				</div>
			</header>
		</div>
	);
}

export default App;
