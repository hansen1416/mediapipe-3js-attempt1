import Cookies from 'js-cookie'
import Icon from '@ant-design/icons'
import T, { $tt } from '../../../locales/lang'
import { ReactComponent as InfoIcon } from '../../../assets/svg/infoOutlined.svg'
import { ReactComponent as InfoOutlinedSvg } from '../../../assets/svg/infoOutlined.svg'

import Camera from '../../../assets/svg/video-icon.svg'
import { Button, Col, Input, InputNumber, message, Row, Select, Space, Switch } from 'antd'
import { getMapObject, getBaseLayers, pipelineColorMapping } from '../../../utils/mapUtil'
import './home-map-style.less'
import L from 'leaflet/dist/leaflet-src'
import { withRouter } from 'dva/router'
import { injectIntl } from 'react-intl'
import { connect } from 'dva'
import * as DataService from './../../../data-service/DataService'
import { createKPIPopupContent, getOverflowIcon, getPreclickPopup } from '../../../components/map/Helper'
import ReactDOMServer from 'react-dom/server'
import DraggableSlider from '../../../components/draggable-slider/DraggableSlider.js'
import { AppTypes, SmartMapOperations } from '../../../constants'
import { getSiteClassName, getWeatherIcon, getRealStraightFlowDirectionData, getShanghaiFLowDirectionData, getSiteIcon } from '../../../utils/mapUtil'
import { PipelineData } from './water-quality/statistic-cards/pseudoPipelineData'


import React, { useEffect, useRef, useState } from 'react'
import LayerSelection from './components/LayerSelection'
import ZoomControls from './components/ZoomControls'
import StatisticsCardBox from './components/StatisticsCardBox'

// import GlobalNav from '../../../components/global-nav/GlobalNav'
// import MapTypeSelector from './components/MapTypeSelectior'

// import { ReactComponent as ExpandIcon } from '../../../assets/svg/expand.svg'
import { ReactComponent as Close } from '../../../assets/svg/close_outline.svg'
import NavigationBar from '../../../components/top-bar/NavigationBar'

import WaterDecomposition from '../water-decomposition/WaterDecomposition'
import 'moment/locale/zh-cn'
import moment from 'moment'
import DashboardSizeSelecter from './components/DashboardSizeSelecter'
import StatisticsCardBoxFlooding from './components/StatisticsCardBoxFlooding'
import FloodingLayers from './components/FloodingLayers'
import Legends from './flooding/Legends'
import ScenarioCompare from '../compare-map/ScenarioCompare'
import CompareMap1 from '../compare-map/CompareMap1'
import CompareMap2 from '../compare-map/CompareMap2'
import HeatmapOverlay from 'leaflet-heatmap/leaflet-heatmap.js'
import StatisticsCardBoxModifyStudio from './components/StatisticsCardBoxModifyStudio'
import { ReactComponent as AllOkIcon } from '../../../assets/svg/okOutlineGreen.svg'
import SimulatorMapHeader from './simulator/SimulatorMapHearder'
import HydroStationIcon from '../../../assets/svg/hydrometric.svg'
import ManholeIcon from '../../../assets/svg/manhole.svg'
import KeyBoard from './simulator/KeyBoard'
import MonitoringLayers from './components/MonitoringLayers'
import WaterQualityMonitor, { waterQualityMonitoringLayers } from './water-quality/WaterQualityMonitor'
import StatisticsCardPipelineMonitor from './water-quality/StatisticsCardPipelineMonitor'
import StatisticsCardDrainerMonitor from './water-quality/StatisticsCardDrainerMonitor'
import StatisticsCardMapIcon from './water-quality/StatisticsCardMapIcon'

import { useHistory } from 'react-router'


let HOME_MAP = null
let baseLayers = null
let combinedPipeNetworksLayer = L.layerGroup()
let pressurePipeNetworksLayer = L.layerGroup()
let wasteWaterNetworksLayer = L.layerGroup()
let drainageNetworksLayer = L.layerGroup()
let videoCameraLayer = L.layerGroup()
let siteClusterGroup = null
let waterLoggingLayer = L.layerGroup()
let zoneOutlineLayer = L.layerGroup()
let networkLayer = L.layerGroup()
let manholeLayer = L.layerGroup()
let heatMapLayer = L.layerGroup()
let flowDirectionLayer = L.layerGroup()
let conditionIconLayer = L.layerGroup()
let networkHighlightLayer = L.layerGroup() // maplayer for highlighting pipeline networks
let connectedSitesLayer = L.layerGroup()
let IOTPipeSitesLayer = L.layerGroup() // special pipeline, sites layer for water IOT pages
let lightColorPipelineNetworkLayer = null // pipeline color with color #5fb5c0, only showing `combined` and `waste water`

let currentIconPopup = null
let apps = null
let siteTypes = ['PUMP STATION', 'PUMP GATE', 'WATER LEVEL SENSOR', 'WATER QUALITY SENSOR', 'FLOW SENSOR', 'PRESSURE SENSOR']
let defaultStyle = {
    color: '#767A84',
    fillColor: '#4E5877',
    fillOpacity: 0.21,
    weight: 5,
    opacity: 0.3,
}

let heatMapConfig = {
    //"radius": 0.00001,
    'radius': 1,
    "maxOpacity": .5,
    "blur": 0.9,
    "scaleRadius": false,
    //"scaleRadius": true,
    "useLocalExtrema": false,
    latField: 'lat',
    lngField: 'long',
    valueField: 'waterDepth',
    gradient: {
        '.10': '#5eb5bf',
        '.25': '#35a569',
        '.5': '#d9ad1a',
        '.75': '#e55b3e',
        '.95': '#e33353'
    }
}

let startHeatmap;
let heatmapimagelayer;
let heatmap_indx = 0;
let heatmapDirection = true;
let heatmap_step = 0;
const heatmap_images = [
'flooding1660063140.png',]

export default function HomeMap(props) {
    const history = useHistory()

    const [selectedZoneId, setSelectedZoneId] = useState('')
    const [selectedWLId, setSelectedWLId] = useState(null)
    const [lastClickedZone, setLastClickedZone] = useState(null)
    const [selectedPSId, setSelectedPSid] = useState(null)
    const [selectedPumpId, setSelectedPumpId] = useState(null)
    const [selectedPipeId, setSelectedPipeId] = useState(null)
    const [zones, setZones] = useState([])

    const [condition, setCondition] = useState(['ALARM', 'WARNING', 'NORMAL'])
    const [running, setRunning] = useState(['RUNNING', 'NOT_RUNNING'])
    const [connection, setConnection] = useState(['CONNECTED', 'NOT_CONNECTED'])

    const [isOpen, setIsOpen] = useState(false)

    const [leftBoxFlex, setLeftBoxFlex] = useState(1)
    const [rightBoxFlex, setRightBoxFlex] = useState(1)

    const [chooseSizeAll, setChooseSizeAll] = useState(false)
    const [chooseSizeHalf, setChooseSizeHalf] = useState(false)
    const [chooseSizeOff, setChooseSizeOff] = useState(true)
    const [sitesOnMap, setSitesOnMap] = useState(null)
    const [screenSize, setScreenSize] = useState('off')

    const [mapType, setMapType] = useState(Cookies.get('mapType') ? Cookies.get('mapType') : 'monitoring') //monitoring
    const [waterDecompositionVisible, setWaterDecompositionVisible] = useState(false)
    const [waterDecompositionExpanded, setWaterDecompositionExpanded] = useState(false)
    const [dateRange, setDateRange] = useState([new Date(moment().add({ day: -7 })).getTime(), new Date(moment()).getTime()])

    const [page, setPage] = useState('overview')

    const [showDepth, setShowDepth] = useState(false)
    const [showDischarge, setShowDischarge] = useState(true)
    const [showDepthRatio, setShowDepthRatio] = useState(false)
    const [showFloodingOverview, setShowFloodingOverview] = useState(true)
    const [showFloodingOverview_title, setShowFloodingOverview_title] = useState($tt('flooding.layers.floodDepth'))
    const [showManholesOverview, setShowManholesOverview] = useState(false)
    const [showManholesOverview_title, setShowManholesOverview_title] = useState($tt('flooding.layers.ManholesOutletsOverflow'))
    
    const [enablePipeFillCompare, setEnablePipeFillCompare] = useState(false)
    const [networkData, setNetworkData] = useState(null)
    const [floodDepth, setFloodDepth] = useState(false)
    const [leftBoxLen, setLeftBoxLen] = useState('')

    const [modifyStudio, setModifyStudio] = useState(false)
    const [showNotificationBox, setShowNotificationBox] = useState(false)
    const [showNotificationBox1, setShowNotificationBox1] = useState(false)

    const [showStation, setShowStation] = useState('all')
    const [showStationType, setShowStationType] = useState('all')

    const [compareMapZoomLevel, setCompareMapZoomLevel] = useState(13.84)
    const [compareMapCenter, setCompareMapCenter] = useState([30.022234854301942, 120.88861297401787])
    const [floodRules, setFloodRules] = useState(false)
    // which layer is selected when in the water quality smart map
    // use this key to display corresponding statistic tab cards
    const [waterQualityLayer, setWaterQualityLayer] = useState('pipeline-monitor')
    // the selected map icon in one of the water quality map layers
    const [waterQualityMapIcon, setWaterQualityMapIcon] = useState({})
    // when start water quality tracing in `StatisticsCardMapIcon`, 
    // pass `step` and `siteinfo` to `WaterQualityMonitor`
    const [siteWaterQualityTracing, setSiteWaterQualityTracing] = useState({})

    const openCondition = window.localStorage.getItem("openCondition")

    const [showKeyBoardBox, setShowKeyBoardBox] = useState(false)
    const [boundary, setBoundary] = useState({})

    const [showA1, setShowA1] = useState(false)
    const [showA2, setShowA2] = useState(false)
    const [showC1, setShowC1] = useState(false)
    const [showD1, setShowD1] = useState(false)

    const [currentZoomLevel, setCurrentZoomLevel] = useState(13.84)

    let timeRange = [
        moment().add({ day: -7 }),
        moment(),
    ]

    useEffect(() => {
        if (openCondition === "1") {
            chooseSize('half')
            window.localStorage.removeItem("openCondition")
            window.localStorage.setItem("linkKey", "5")
        } else {
            window.localStorage.setItem("linkKey", "2")
        }
    }, [])

    useEffect(() => {
        initializeHomeMap()
        addLayers()
        drawAllSites()
        if (Cookies.get('dss-library') !== '1') {
            drawNetworks()
        }

    }, [])

    useEffect(() => {
        let filterdSites = apps?.filter(site => condition.includes(site.alarm_status))
        plotSites(filterdSites)
    }, [condition])

    useEffect(() => {
        let filterdSites = apps?.filter(site => running.includes(site.running_status))
        plotSites(filterdSites)
    }, [running])

    useEffect(() => {
        let filterdSites = apps?.filter(site => connection.includes(site.device_connection))
        plotSites(filterdSites)
    }, [connection])

    useEffect(() => {
        HOME_MAP.invalidateSize(true)

        let leftBox = document.getElementsByClassName('leftBox')[0]
        let leftBoxLen = leftBox?.offsetWidth
        setLeftBoxLen(leftBoxLen)

    }, [chooseSizeAll, chooseSizeHalf, chooseSizeOff, isOpen, leftBoxFlex])

    useEffect(() => {
        if (Cookies.get('_lang') === 'zh-CN') {
            if (HOME_MAP) {
                HOME_MAP.removeLayer(baseLayers.Default)
                HOME_MAP.addLayer(baseLayers.Chinese)
            }
        } else if (Cookies.get('_lang') === 'en-US') {
            if (HOME_MAP) {
                HOME_MAP.removeLayer(baseLayers.Chinese)
                HOME_MAP.addLayer(baseLayers.Default)
            }
        }
    }, [Cookies.get('_lang')])

    useEffect(() => {
        if (enablePipeFillCompare) {
            setLeftBoxFlex(2)
        } else {
            setLeftBoxFlex(1)
        }
    }, [enablePipeFillCompare])

    function playheatmap(timestamp) {

        if (startHeatmap === undefined) {
            startHeatmap = timestamp;
        }

        const elapsed = parseInt(timestamp - startHeatmap);

        if (heatmap_step % 4 == 0){

            // let imageUrl = process.env.PUBLIC_URL + '/image/flooding/' + heatmap_images[heatmap_indx];
            let imageUrl = process.env.PUBLIC_URL + '/image/flooding/' + heatmap_images[0];

            if (heatmapDirection) {
                heatmap_indx += 1
            } else {
                heatmap_indx -= 1
            }

            // console.log(heatmap_indx, heatmapDirection)

            if (heatmap_indx >= heatmap_images.length-1 || heatmap_indx <= 0) {
                heatmapDirection = !heatmapDirection
            }

            if (heatmapimagelayer) {
                HOME_MAP.removeLayer(heatmapimagelayer);
            }

            const imageBounds = [
                [30.00038321959343, 120.83071438951838],
                [30.056921240670786, 120.9071776437796],
            ];
            
            heatmapimagelayer = L.imageOverlay(imageUrl, imageBounds)
            heatmapimagelayer.addTo(HOME_MAP);
        }

        heatmap_step += 1

        if (elapsed < 10000) { // Stop the animation after 2 seconds
            window.requestAnimationFrame(playheatmap);

        } else {
            startHeatmap = undefined;
            heatmap_step = 0
        }

        // window.requestAnimationFrame(playheatmap);
    }

    // watch `mapType`
    useEffect(() => {
        // if this layer is not generated
        if (!lightColorPipelineNetworkLayer) {
            drawLightColorPipelineNetworkLayer()
        }

        // switch between a colorful pipeline network and a single color pipeline network
        // NOTE THAT here I only controled `combinedPipeNetworksLayer` and `wasteWaterNetworksLayer`
        // because these two are default displayed, 
        // there are two more typef of pipeline networks `drainageNetworksLayer` and `pressurePipeNetworksLayer`
        // they should be taken into consideration as well
        if (mapType === 'monitoring') {

            // HOME_MAP.addLayer(lightColorPipelineNetworkLayer)

            // HOME_MAP.removeLayer(combinedPipeNetworksLayer)
            // HOME_MAP.removeLayer(wasteWaterNetworksLayer)

            // test image layer
            window.requestAnimationFrame(playheatmap)
            
        } else if (mapType === 'sewage') {

            HOME_MAP.addLayer(lightColorPipelineNetworkLayer)

            HOME_MAP.removeLayer(combinedPipeNetworksLayer)
            HOME_MAP.removeLayer(wasteWaterNetworksLayer)

        } else if (mapType === 'flooding') {

            HOME_MAP.removeLayer(lightColorPipelineNetworkLayer)

            HOME_MAP.addLayer(combinedPipeNetworksLayer)
            HOME_MAP.addLayer(wasteWaterNetworksLayer)

        } else if (mapType === 'energy') {

        } else if (mapType === 'quality') {

            HOME_MAP.addLayer(lightColorPipelineNetworkLayer)

            HOME_MAP.removeLayer(combinedPipeNetworksLayer)
            HOME_MAP.removeLayer(wasteWaterNetworksLayer)
        }


    }, [mapType])

    function chooseSize(type) {
        if (type === 'all') {
            setScreenSize('all')
            onAll()
        } else if (type === 'half') {
            setScreenSize('half')
            onHalf()
        } else if (type === 'off') {
            setScreenSize('off')
            onOff()
        }
    }

    function onAll() {
        setChooseSizeAll(true)
        setChooseSizeHalf(false)
        setChooseSizeOff(false)
        setIsOpen(true)
        setLeftBoxFlex(0)
        setScreenSize('all')
    }

    function onHalf() {
        setChooseSizeAll(false)
        setChooseSizeHalf(true)
        setChooseSizeOff(false)
        setIsOpen(true)
        if (enablePipeFillCompare) {
            setLeftBoxFlex(2)
        } else {
            setLeftBoxFlex(1)
        }
        setScreenSize('half')
    }

    function onOff() {
        setChooseSizeAll(false)
        setChooseSizeHalf(false)
        setChooseSizeOff(true)
        setIsOpen(false)
        setLeftBoxFlex(1)
        setScreenSize('off')
    }

    function clearManholes() {
        // console.log('clearManholes');
        manholeLayer.clearLayers()
    }

    function plotManholes() {
        console.log('plotManholes');

        manholeLayer = L.layerGroup()
        manholeLayer.clearLayers()



        let param = {
            params: {
                owner_Id: Cookies.get('currentOwnerId'),
                scenario_Id: '856184e8-2fe4-41fc-8cf9-203be4d147b9',
                frequency: 1,
                start_time: Math.round(new Date().getTime() / 1000),
                overflow_node_type: 3
            },
        }

        DataService.getDataByParams('result/network/node-overflow-dynamic', param, response => {
            let manholeDetails = response.data.data
            let overflowArray = manholeDetails.data
            let idArray = manholeDetails.iDs
            let manholes = []

            console.log('--->Number of Manholes: ' + manholeDetails.length)

            //idArray.forEach((id, index) => {
            //manholes.push({ name: id, overflow: overflowArray[index] })
            // })

            let parameters = {
                params: {
                    owner_id: Cookies.get('currentOwnerId'),
                },
                // cancelToken: this.xhrSourceLayerUpdate.token
            }

            DataService.getDataByParams('api/manhole', parameters, res => {
                let manholeStaticData = res.data.data

                manholeStaticData.forEach((value, index) => {
                    idArray.forEach((id, indx) => {
                        if (id.split(',')[0] === value.point_name) {
                            manholes.push({
                                name: id.split(',')[0],
                                overflow: overflowArray[indx],
                                lat: parseFloat(value.point_y),
                                long: parseFloat(value.point_x),
                                ground_elevation: value.ground_elevation,
                                chinese_name: value.manhole,

                            })
                        }
                    })
                })


                let maxOverflow = Math.max(...overflowArray)
                debugger
                manholes.forEach((manhole, index) => {
                    if (true) {
                        let randomColor = getManholeColor(manhole.overflow, maxOverflow)
                        L.circleMarker([parseFloat(manhole.lat), parseFloat(manhole.long)], {
                            color: randomColor,
                            fillColor: randomColor,
                            fillOpacity: 1,
                            radius: 5,
                            weight: 1
                        }).bindPopup(
                            ReactDOMServer.renderToString(<div>
                                <span >{$tt('map.manhole-info')}</span> <br /><br />
                                {$tt('map.manhole.name')}: {manhole.chinese_name} <br />
                                {$tt('map.manhole.ground-elevation')}: {manhole.ground_elevation} <br />
                            </div>)
                        ).addTo(manholeLayer)
                    }
                })
                HOME_MAP.addLayer(manholeLayer)





            }, errorResponse => {
                console.warn(errorResponse.message)
            })




        }, errorResponse => {
            console.warn(errorResponse.message)
        })
    }

    function getManholeColor(value, maxOverflow) {
        let percentage = Math.round((value / maxOverflow) * 100)
        let color = '#5fb5c0'
        if (percentage < 10) {
            color = '#5fb5c0'
        } else if (percentage >= 10 && percentage < 30) {
            color = '#076eb5'
        } else if (percentage >= 30 && percentage < 60) {
            color = '#8e6ec0'
        } else if (percentage >= 60 && percentage < 90) {
            color = '#ad5d90'
        } else if (percentage >= 90) {
            color = '#ba5372'
        }
        return color

    }

    function onClickCompare() {
        let compare = enablePipeFillCompare
        setEnablePipeFillCompare(!compare)
    }

    function onShowKeyBoard() {
        setShowKeyBoardBox(!showKeyBoardBox)
    }


    function exitWithoutSaving() {
        setModifyStudio(false)
    }

    function saveToLiveMap() {
        setModifyStudio(false)
        setShowNotificationBox(true)
        setShowNotificationBox1(true)
        onOff()
        setShowKeyBoardBox(false)
    }


    return (
        <div style={{ position: 'relative' }}>
            {
                showKeyBoardBox &&
                <KeyBoard
                    saveToLiveMap={saveToLiveMap}
                />
            }

            {
                !modifyStudio && Cookies.get('dss-library') !== '1' &&
                <div style={{ position: 'absolute', width: '100%', zIndex: 417 }}>
                    <Row gutter={[0, 0]} >
                        <Col span={24} style={{ zIndex: 416 }}>
                            <NavigationBar
                                onResponse={updateMapLayers}
                                sites={sitesOnMap}
                                selectDeviceFromTopNav={selectDeviceFromTopNav}
                                mapType={mapType}
                            />
                        </Col>
                    </Row>
                </div>
            }

            {
                Cookies.get('dss-library') === '1' &&
                <div style={{ position: 'absolute', width: '100%', zIndex: 417, top: 18, left: 16 }}>
                    <SimulatorMapHeader
                        onResponse={updateMapLayers}
                        setShowKeyBoardBox={setShowKeyBoardBox}
                        showKeyBoardBox={showKeyBoardBox}
                    />
                </div>
            }


            {
                modifyStudio && chooseSizeHalf &&
                <>
                    <div style={{ position: 'absolute', left: '24px', top: '16px', zIndex: 415 }}>
                        <div className='modifyStudioTag'>
                            <Icon component={InfoOutlinedSvg} style={{ fontSize: 20, opacity: '0.5', float: 'left' }} />
                            <span><T id={'dss.condition.Studio-Modifying-Live-Conditions'} /></span>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', right: '16px', top: '16px', zIndex: 415 }}>
                        <Button type='default' onClick={() => exitWithoutSaving()} className='button-name'><T id={'dss.condition.exitWithoutSaving'} /></Button>
                        <Button type='primary' onClick={() => saveToLiveMap()} className='button-name' style={{ marginLeft: '20px', width: '144px' }}><T id={'dss.condition.saveToLiveMap'} /></Button>
                    </div>

                </>

            }


            {
                (mapType === 'monitoring' || mapType === 'flooding' || mapType === 'quality') &&
                <div style={{ position: 'absolute', right: '16px', top: chooseSizeOff ? '186px' : '68px', zIndex: 415 }}>
                    <DashboardSizeSelecter
                        chooseSize={chooseSize}
                        chooseSizeAll={chooseSizeAll}
                        chooseSizeHalf={chooseSizeHalf}
                        chooseSizeOff={chooseSizeOff}
                        modifyStudio={modifyStudio}
                    />
                </div>
            }


            <div className={"HomeMap"} >
                <div className={"homeMapItemBox leftBox"} style={{ flex: leftBoxFlex }}>
                    {
                        //!enablePipeFillCompare &&
                        !chooseSizeAll && !modifyStudio && Cookies.get('dss-library') !== '1' && (mapType !== 'quality' && mapType !== 'monitoring') &&
                        <div style={{ position: 'absolute', top: 220, left: 16, zIndex: 415 }} >
                            <Button type='primary' onClick={onClickCompare} className='button-name' style={{ minWidth: 'auto' }}>{!enablePipeFillCompare ? <T id={'flooding.EnableComparison'} /> : <T id={'flooding.DisableComparison'} />}</Button>
                        </div>
                    }

                    {
                        showNotificationBox &&
                        <div style={{ position: 'absolute', top: 196, left: 16, zIndex: 415 }} >
                            {/* {
                                showNotificationBox1 &&
                                <div className='notificationBox' onClick={()=>setShowNotificationBox1(false)}>
                                    <div className='title'>
                                        <Icon component={InfoOutlinedSvg} style={{ fontSize: 20, opacity: '0.5', float:'left' }} />
                                        <span>Generating new live scenario</span>
                                    </div>
                                    <div className='content'>
                                        Your new scenario width the modified regulation rule is being generated and will be availbale in XX minutes.
                                        <div className='loadingIcon'><div className='demoLoading'>80%</div></div>
                                    </div>
                                </div>
                            } */}

                            <div className='notificationBox'>
                                <div className='title'>
                                    <Icon component={InfoOutlinedSvg} style={{ fontSize: 20, opacity: '0.5', float: 'left' }} />
                                    <span>新场景已生成</span>
                                </div>
                                <div className='content'>
                                    <div>新场景已生成</div>
                                    <div>新场景已生成，点击按钮替换当前场景</div>
                                    <div className='loadingIcon'><Icon component={AllOkIcon} style={{ fontSize: 40, opacity: '0.7' }} /></div>
                                </div>
                                <Button type='primary'
                                    onClick={() => setShowNotificationBox(false)}
                                    className='button-name'
                                    style={{ minWidth: 'auto', marginTop: 16 }}
                                >
                                    使用
                                </Button>
                            </div>

                        </div>
                    }

                    <div id='home-map' className={"homeMap"} style={{ display: enablePipeFillCompare ? 'none' : '' }} />
                    {
                        !modifyStudio && enablePipeFillCompare && (networkData !== null || floodDepth) && !chooseSizeAll &&
                        <ScenarioCompare
                            leftBoxLen={leftBoxLen}
                            chooseSizeHalf={chooseSizeHalf}

                            leftSide={<CompareMap1
                                onResponse={updateMapLayers}
                                zoomLevel={compareMapZoomLevel}
                                center={compareMapCenter}
                                data={networkData}
                                floodDepth={floodDepth}
                                chooseSizeHalf={chooseSizeHalf}
                                leftBoxFlex={leftBoxFlex}
                                floodRules={floodRules}
                            />}
                            rightSide={<CompareMap2
                                onResponse={updateMapLayers}
                                zoomLevel={compareMapZoomLevel}
                                center={compareMapCenter}
                                data={networkData}
                                floodDepth={floodDepth}
                                floodRules={floodRules}
                                chooseSizeHalf={chooseSizeHalf}
                                leftBoxFlex={leftBoxFlex}
                            />}
                        />
                    }

                    <div style={{ position: 'absolute', width: '100%', zIndex: 416, top: '53px' }}>
                        {
                            !chooseSizeAll && !modifyStudio &&
                            <Row gutter={[0, 0]} >
                                <Col span={24} style={{ zIndex: 415 }}>
                                    <DraggableSlider onSelectTime={handleSliderTime} onOff={onOff} size={screenSize} />
                                </Col>
                            </Row>
                        }
                    </div>
                    <div style={{ position: 'absolute', bottom: (16 + 40), right: 16, zIndex: 415 }}>
                        <ZoomControls onResponse={changeZoomLevel} />
                    </div>

                    {
                        mapType !== 'monitoring' &&
                        <div style={{ position: 'absolute', bottom: (16 + 40), right: 70, zIndex: 415 }}>
                            <LayerSelection onResponse={updateMapLayers} />
                        </div>
                    }

                    {
                        mapType === 'flooding' && !modifyStudio &&
                        <>
                            <div style={{ position: 'absolute', right: '16px', top: '230px', zIndex: 415 }}>
                                <FloodingLayers
                                    onResponse={updateMapLayers}

                                    plotManholes={plotManholes}
                                    clearManholes={clearManholes}

                                    setShowDepth={setShowDepth}
                                    setShowDischarge={setShowDischarge}
                                    setShowDepthRatio={setShowDepthRatio}
                                    setShowFloodingOverview={setShowFloodingOverview}
                                    setShowFloodingOverview_title={setShowFloodingOverview_title}
                                    setShowManholesOverview={setShowManholesOverview}
                                    setShowManholesOverview_title={setShowManholesOverview_title}
                                />
                            </div>
                            {
                                !chooseSizeAll &&
                                <div style={{ position: 'absolute', bottom: (16 + 40), left: 16, zIndex: 415 }}>
                                    <Legends
                                        showDepth={showDepth}
                                        showDischarge={showDischarge}
                                        showDepthRatio={showDepthRatio}
                                    />
                                </div>
                            }

                        </>
                    }

                    {
                        mapType === 'monitoring' &&
                        <>
                            <div style={{ position: 'absolute', right: '16px', top: '230px', zIndex: 415 }}>
                                <MonitoringLayers
                                    onResponse={updateMapLayers}
                                    setShowA1={setShowA1}
                                    setShowA2={setShowA2}
                                    setShowC1={setShowC1}
                                    setShowD1={setShowD1}

                                />
                            </div>
                        </>
                    }

                    {
                        // water quality quality page, map layer switch
                        mapType === 'quality' &&
                        <>
                            <div className={"homeMapItemBox leftBox"} style={{ position: 'absolute', right: '16px', top: '230px', zIndex: 415, overflow: 'visible' }}>
                                <WaterQualityMonitor
                                    // when switch the layers, we need to update `HOME_MAP`, for this comp, data.name === 'quality-monitor'
                                    onResponse={updateMapLayers}
                                    chooseSize={chooseSize}
                                    // when click on a 'icon' in one of the water quality map layers
                                    // open the statistic card for such 'icon'
                                    onClickMapIcon={(data) => setWaterQualityMapIcon(data)}
                                    // pass tracing `siteinfo` and `step`
                                    siteTracingInfo={siteWaterQualityTracing}
                                />
                            </div>
                            {
                                !chooseSizeAll &&
                                <div style={{ position: 'absolute', bottom: (16 + 40), left: 16, zIndex: 415 }}>
                                    <Legends
                                        showDepth={showDepth}
                                        showDischarge={showDischarge}
                                    />
                                </div>
                            }
                        </>
                    }
                </div>


                {
                    isOpen && mapType === 'monitoring' &&
                    <div className={"homeMapItemBox rightBox"} style={{ paddingTop: chooseSizeAll ? '100px' : '100px' }}>
                        <StatisticsCardBox
                            onResponse={updateMapLayers}
                            selectedZoneId={selectedZoneId}
                            selectedSiteId={selectedPSId}
                            selectedPumpId={selectedPumpId}

                            chooseSizeAll={chooseSizeAll}
                            chooseSizeHalf={chooseSizeHalf}

                            page={page}

                            showA1={showA1}
                            showA2={showA2}
                            showC1={showC1}
                            showD1={showD1}
                        />
                    </div>
                }


                {
                    isOpen && mapType === 'flooding' && !modifyStudio &&
                    <div className={"homeMapItemBox rightBox"} style={{ paddingTop: chooseSizeAll ? '100px' : '100px' }}>
                        <StatisticsCardBoxFlooding
                            onResponse={updateMapLayers}
                            pipeId={selectedPipeId}
                            chooseSizeAll={chooseSizeAll}
                            page={page}
                            enablePipeFillCompare={enablePipeFillCompare}
                            showDepth={showDepth}
                            showDischarge={showDischarge}
                            waterLoggingId={selectedWLId}

                            setModifyStudio={setModifyStudio}
                            showStationType={showStationType}
                            setShowStationType={setShowStationType}
                            showStation={showStation}
                            setShowStation={setShowStation}

                            showDepthRatio={showDepthRatio}

                            showFloodingOverview={showFloodingOverview}
                            showFloodingOverview_title={showFloodingOverview_title}
                            showManholesOverview={showManholesOverview}
                            showManholesOverview_title={showManholesOverview_title}
                        />
                    </div>
                }

                {
                    isOpen && mapType === 'flooding' && modifyStudio &&
                    <div className={"homeMapItemBox rightBox"} style={{ paddingTop: chooseSizeAll && modifyStudio ? '0px' : '100px' }}>
                        <StatisticsCardBoxModifyStudio
                            onResponse={updateMapLayers}
                            chooseSizeAll={chooseSizeAll}
                            page={page}

                            setModifyStudio={setModifyStudio}

                            showStation={showStation}
                            showStationType={showStationType}
                        />
                    </div>
                }

                {
                    mapType === 'sewage' && (selectedPSId || selectedZoneId) &&

                    <div className='wt-popup' style={{ width: waterDecompositionExpanded ? document.documentElement.clientWidth : 800, height: waterDecompositionExpanded ? document.documentElement.clientHeight + 80 : 650, padding: 16 }}>
                        <span style={{ cursor: 'pointer', float: 'right', marginTop: 7 }} >
                            {/* <Icon component={ExpandIcon} style={{ fontSize: 18, opacity: '0.8' }} onClick={resizeWaterDecomposition} /> */}
                            <Icon component={Close} style={{ fontSize: 20, opacity: '0.8' }} onClick={closeWaterDecompositionWindow} />
                        </span>
                        <WaterDecomposition style={{ zIndex: 99900000, }} type={selectedZoneId ? 'zone' : 'site'} id={selectedZoneId ? selectedZoneId : selectedPSId} startDate={dateRange} expanded={waterDecompositionExpanded} />
                    </div>
                }

                {
                    // water quality monitor page, `pipeline-monitor` statistic right side card
                    isOpen && mapType === 'quality' && (!waterQualityMapIcon || !waterQualityMapIcon.app_id) && waterQualityLayer === 'pipeline-monitor' &&
                    <div className={"homeMapItemBox rightBox"} style={{ paddingTop: chooseSizeAll && modifyStudio ? '0px' : '100px' }}>
                        <StatisticsCardPipelineMonitor
                            chooseSizeAll={chooseSizeAll}
                            onClickMapIcon={(data) => setWaterQualityMapIcon(data)}
                            chooseSize={chooseSize}
                            onResponse={updateMapLayers}
                        />
                    </div>
                }

                {
                    // water quality monitor page, `drainer-monitor` statistic right side card
                    isOpen && mapType === 'quality' && (!waterQualityMapIcon || !waterQualityMapIcon.app_id) && waterQualityLayer === 'drainer-monitor' &&
                    <div className={"homeMapItemBox rightBox"} style={{ paddingTop: chooseSizeAll && modifyStudio ? '0px' : '100px' }}>
                        <StatisticsCardDrainerMonitor
                            chooseSizeAll={chooseSizeAll}
                            onClickMapIcon={(data) => setWaterQualityMapIcon(data)}
                        />
                    </div>
                }

                {
                    // water quality monitor page, selected map icon statistic right side card
                    // note that this condition override `pipeline-monitor` and `drainer-monitor` statistic right side card
                    isOpen && mapType === 'quality' && waterQualityMapIcon && waterQualityMapIcon.app_id &&
                    <div className={"homeMapItemBox rightBox"} style={{ paddingTop: chooseSizeAll && modifyStudio ? '0px' : '100px' }}>
                        <StatisticsCardMapIcon
                            chooseSizeAll={chooseSizeAll}
                            // passing water quality monitoring site info
                            siteInfo={waterQualityMapIcon}
                            // when click on tracing, pass the info to `WaterQualityMonitor`
                            onTracing={(data) => setSiteWaterQualityTracing(data)}
                            onResponse={updateMapLayers}
                        />
                    </div>
                }
            </div>
        </div >
    )

    function resizeWaterDecomposition() {
        setWaterDecompositionExpanded(!waterDecompositionExpanded)
    }

    function closeWaterDecompositionWindow() {
        setSelectedPSid(null)
        setSelectedZoneId(null)
        setSelectedPumpId(null)
        closeApplicationList()
    }

    function closeApplicationList() {
        setLastClickedZone(null)

        /*
                this.setState({
                    applicationsVisible: false,
                    lastClickedZone: null,
                    selectedZone: '',
                    selectedZoneZh: '',
                })
        */

        if (lastClickedZone != null) {
            lastClickedZone.setStyle(defaultStyle)
        }
    }

    function handleSliderTime(data) {

        let parameters = {
            params: {
                owner_id: Cookies.get('currentOwnerId'),
                timestamp: Math.round(data / 1000)
            }
        }

        DataService.getDataByParams(`/api/timetraveler/pumpstation`, parameters, response => {
            let sites = response.data.data
            let allApps = []
            apps.forEach(site => {
                sites.forEach(st => {
                    if (site.app_id === st.app_id) {
                        site.device_connection = st.device_connection
                        site.running_status = st.running_status
                        site.alarm_status = st.alarm_status
                        allApps.push(site)
                    }
                })
            })

            plotSites(allApps)
            setSitesOnMap(allApps)

        }, errorResponse => {
            console.warn(errorResponse.message)
        })
    }


    function addLayers() {
        HOME_MAP.addLayer(combinedPipeNetworksLayer)
        // HOME_MAP.addLayer(pressurePipeNetworksLayer)
        HOME_MAP.addLayer(wasteWaterNetworksLayer)
        HOME_MAP.addLayer(drainageNetworksLayer)
        HOME_MAP.addLayer(videoCameraLayer)

        HOME_MAP.addLayer(props.locale === 'en-US' ? baseLayers.Default : baseLayers.Chinese)


    }

    function initializeHomeMap() {
        HOME_MAP = getMapObject('home-map')
        baseLayers = getBaseLayers()

        HOME_MAP.on('click', (e) => {

            //setSelectedPipeId(null)
        })

        HOME_MAP.on('zoomend', () => {
            //getBoundary()
            let zoomLevel = HOME_MAP.getZoom()
        })
        getBoundary()
        //addHeatMap()
        drawFlowDirection()
    }

    function getBoundary() {
        let boundary = HOME_MAP.getBounds()
        let corners = {
            southWest: [boundary.getSouthWest().lat, boundary.getSouthWest().lat],
            northEast: [boundary.getNorthEast().lat, boundary.getNorthEast().lat],
            northWest: [boundary.getNorthWest().lat, boundary.getNorthWest().lat],
            southEast: [boundary.getSouthEast().lat, boundary.getSouthEast().lat]
        }
        setBoundary(corners)
        console.log(corners)
        getHeatMapData(corners)
    }

    function getHeatMapData(corners) {

        heatMapLayer.clearLayers()
        //----- mockup ----

        //let heatMap = new HeatmapOverlay(heatMapConfig)
        //heatMap.setData(getTestHeatMap)
        //heatMapLayer.addLayer(heatMap)
        //http://localhost:7300/result/2d/dynamic/current?owner_Id=2&current_time=1658730919&frequency=10&zoom_level=16

        //for (let i = 0; i < 1; i++) {
        let parameters = {
            params: {
                //boundary: corners,
                owner_Id: Cookies.get('currentOwnerId'),
                //zoom_level: HOME_MAP.getZoom(),
                zoom_level: 16,
                frequency: 10,
                current_time: Math.round(new Date().getTime() / 1000),
                identifier: 1,
                //chunk_index: i,
                is_chunked: 0
            }
        }
        DataService.getDataByParams(`/result/2d/dynamic/current`, parameters, response => {
            let data = response.data.data
            debugger
            let heatMap = new HeatmapOverlay(heatMapConfig)
            data['data'] = data.points
            heatMap.setData(data)
            heatMapLayer.addLayer(heatMap)
        })

        //}

//         DataService.getDataByParams(`/result/manhole/dynamic`, parameters, response => {
//             let data = response.data.data
//             // let heatMap = new HeatmapOverlay(hmconfig)

// console.log("manhole data", data)

//             let manholeLayer = L.layerGroup()

//             for (let muid in data) {
//                 L.marker(
//                     L.latLng(parseFloat(data[muid][0]),
//                         parseFloat(data[muid][1])),
//                     { icon: L.icon({
//                         iconUrl: ManholeIcon,
//                         iconSize: [10, 10],
//                     }) }
//                 ).addTo(manholeLayer)
//             }

//             HOME_MAP.addLayer(manholeLayer)
//         })


    }


    /*
        function getTestHeatMap() {
    
            let testData = {
                max: 100,
                min: 0,
                data: [{
                    lat: 30.035,
                    lng: 120.870,
                    count: 90
                },
                {
                    lat: 30.035,
                    lng: 120.875,
                    count: 80
                }]
    
        }
        */

    function drawNetworks() {
        networkLayer = plotNetworksOnMap(networkLayer)

    }

    function drawAllSites() {
        let parameters = {
            params: {}
        }
        DataService.getDataByParams(`api/owner/map/${Cookies.get('currentOwnerId')}`, parameters, response => {
            apps = response.data.data.apps
            if (Cookies.get('dss-library') !== '1') {
                addSites(response.data.data.apps)//Site icons automaticall bounds to fit screen. So cant set zoom.
            }

            setSitesOnMap(response.data.data.apps)
            setZones(response.data.data.zones)
            zoneOutlineLayer.clearLayers()
            if (Cookies.get('dss-library') == '1') {
                response.data.data.zones.forEach(zone => {
                    plotZoneOutline(zone)
                })
                //Cookies.set('dss-library', '0')
            }

        }, errorResponse => {
            console.warn(errorResponse.message)
        })
    }

    function addSites(sites) {
        let siteIcon = null
        if (siteClusterGroup !== null) {
            siteClusterGroup.clearLayers()
        }

        siteClusterGroup = null
        siteClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 30,
            showCoverageOnHover: false,
            iconCreateFunction: (cluster) => {
                let markers = cluster.getAllChildMarkers()
                let className = getSiteClassName(markers)
                return L.divIcon({ html: markers.length, className: className, iconSize: L.point(40, 40) })
            },
        })

        sites && sites.forEach(site => {
            if (site.longitude > 0 && site.latitude > 0 && site.longitude !== 120 && site.latitude !== 30) {
                siteIcon = getSiteIcon(site)
                if (site.type === 'Pump Station') {
                    createSiteMarker(site, siteIcon)
                } else if (site.type === 'Pump Gate') {
                    createSiteMarker(site, siteIcon)
                }
                else if (site.type === 'Water Quality Sensor') {
                    createSiteMarker(site, siteIcon)
                } else if (site.type === 'Water Level Sensor') {
                    createSiteMarker(site, siteIcon)
                } else if (site.type === 'Flow Sensor') {
                    createSiteMarker(site, siteIcon)
                } else if (site.type === 'Pressure Sensor') {
                    createSiteMarker(site, siteIcon)
                }
            }
        })


    }

    function drawSites() {
        let parameters = {
            params: {}
        }
        DataService.getDataByParams(`api/owner/map/${Cookies.get('currentOwnerId')}`, parameters, response => {
            apps = response.data.data.apps
            plotSites(response.data.data.apps)//Site icons automaticall bounds to fit screen. So cant set zoom.
            setSitesOnMap(response.data.data.apps)
            setZones(response.data.data.zones)
            zoneOutlineLayer.clearLayers()
            response.data.data.zones.forEach(zone => {
                plotZoneOutline(zone)
            })
        }, errorResponse => {
            console.warn(errorResponse.message)
        })
    }

    function plotPumpStationsWithEnergy() {
        let sites = apps
        let siteIcon = null
        if (siteClusterGroup !== null) {
            siteClusterGroup.clearLayers()
        }

        siteClusterGroup = null
        siteClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 30,
            showCoverageOnHover: false,
            iconCreateFunction: (cluster) => {
                let markers = cluster.getAllChildMarkers()
                let className = getSiteClassName(markers)
                return L.divIcon({ html: markers.length, className: className, iconSize: L.point(40, 40) })
            },
        })

        sites && sites.forEach(site => {
            if (site.longitude > 0 && site.latitude > 0 && site.longitude !== 120 && site.latitude !== 30) {
                siteIcon = getSiteIcon(site)
                if (site.type === 'Pump Station') {
                    createSiteEnergyMarker(site, siteIcon)
                }
            }
        })

        HOME_MAP.addLayer(siteClusterGroup)
    }

    function createSiteEnergyMarker(site, siteIcon) {
        let marker = L.marker(
            L.latLng(parseFloat(site.longitude),
                parseFloat(site.latitude)),
            { icon: siteIcon, alarm_status: site.alarm_status, running_status: site.running_status, connection_status: site.device_connection }
        )
        //marker.bindTooltip(this.props.locale === 'en-US' ? site.app_name : site.app_name_zh, { className: 'leaflet-tooltip', direction: 'top' })//.openTooltip()

        //marker.on('preclick', (e) => {
        //marker.bindPopup(getPreclickPopup())
        //})

        marker.on('click', (e) => {
            history.push('/site-energy')
        })

        siteClusterGroup.addLayer(marker)
    }



    function plotSites(sites) {
        let siteIcon = null
        if (siteClusterGroup !== null) {
            siteClusterGroup.clearLayers()
        }

        siteClusterGroup = null
        siteClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 30,
            showCoverageOnHover: false,
            iconCreateFunction: (cluster) => {
                let markers = cluster.getAllChildMarkers()
                let className = getSiteClassName(markers)
                return L.divIcon({ html: markers.length, className: className, iconSize: L.point(40, 40) })
            },
        })

        sites && sites.forEach(site => {
            if (site.longitude > 0 && site.latitude > 0 && site.longitude !== 120 && site.latitude !== 30) {
                siteIcon = getSiteIcon(site)
                if (site.type === 'Pump Station') {
                    createSiteMarker(site, siteIcon)
                } else if (site.type === 'Pump Gate') {
                    createSiteMarker(site, siteIcon)
                }
                else if (site.type === 'Water Quality Sensor') {
                    createSiteMarker(site, siteIcon)
                } else if (site.type === 'Water Level Sensor') {
                    createSiteMarker(site, siteIcon)
                } else if (site.type === 'Flow Sensor') {
                    createSiteMarker(site, siteIcon)
                } else if (site.type === 'Pressure Sensor') {
                    createSiteMarker(site, siteIcon)
                }
            }
        })

        HOME_MAP.addLayer(siteClusterGroup)

        /*
                if (window.sessionStorage.getItem('searchLocation') && window.sessionStorage.getItem('searchLocation').split(',').length === 2) {
                    HOME_MAP.setView(window.sessionStorage.getItem('searchLocation').split(','), 16.6)
                    window.sessionStorage.removeItem('searchLocation')
                } if (window.sessionStorage.getItem('zoomLevel') && window.sessionStorage.getItem('mapCenter')) {
                    let center = window.sessionStorage.getItem('mapCenter').split(',')
                    HOME_MAP.setView([parseFloat(center[0]), parseFloat(center[1])], parseFloat(window.sessionStorage.getItem('zoomLevel')))
                } else if (siteClusterGroup.getBounds()._northEast !== undefined) {//Automatically fits the Map based on the plotted sites.
                    HOME_MAP.fitBounds(siteClusterGroup.getBounds(), { padding: [200, 200] })
                }
                */
    }

    function plotSitesOnly(sites) {
        let siteIcon = null
        if (siteClusterGroup !== null) {
            siteClusterGroup.clearLayers()
        }

        siteClusterGroup = null
        siteClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 30,
            showCoverageOnHover: false,
            iconCreateFunction: (cluster) => {
                let markers = cluster.getAllChildMarkers()
                let className = getSiteClassName(markers)
                return L.divIcon({ html: markers.length, className: className, iconSize: L.point(40, 40) })
            },
        })

        sites && sites.forEach(site => {
            if (site.longitude > 0 && site.latitude > 0 && site.longitude !== 120 && site.latitude !== 30) {
                siteIcon = getSiteIcon(site, [45, 45])
                if (site.type === 'Pump Station') {
                    createSiteMarker(site, siteIcon)
                }
            }
        })

        HOME_MAP.addLayer(siteClusterGroup)

    }

    function createSiteMarker(site, siteIcon) {
        let marker = L.marker(
            L.latLng(parseFloat(site.longitude),
                parseFloat(site.latitude)),
            { icon: siteIcon, alarm_status: site.alarm_status, running_status: site.running_status, connection_status: site.device_connection }
        )
        //marker.bindTooltip(this.props.locale === 'en-US' ? site.app_name : site.app_name_zh, { className: 'leaflet-tooltip', direction: 'top' })//.openTooltip()

        //marker.on('preclick', (e) => {
        //marker.bindPopup(getPreclickPopup())
        //})

        marker.on('click', (e) => {
            currentIconPopup = {
                "appId": site.app_id,
                "appName": props.locale === 'en-US' ? site.app_name : site.app_name_zh,
                "appType": site.app_type_id,
                "popup": null
            }
            setSelectedPSid(site.app_id)
            setSelectedZoneId(null)
            if (window.lastClickedZone != null) {
                window.lastClickedZone.setStyle(defaultStyle)
            }

            if (mapType === 'monitoring') {
                setPage('site')
                chooseSize('half')
            }


        })

        siteClusterGroup.addLayer(marker)
    }
    function updateSiteTypes(type, enabled) {
        let filterdSites = null
        if (enabled) {
            if (!siteTypes.includes(type)) {
                siteTypes = [...siteTypes, type]
                filterdSites = apps.filter(site => siteTypes.includes(site.type.toUpperCase()))
                plotSites(filterdSites)
            }
        } else {
            let updatedSiteTypes = siteTypes.filter(st => st !== type)
            siteTypes = updatedSiteTypes
            filterdSites = apps.filter(site => updatedSiteTypes.includes(site.type.toUpperCase()))
            plotSites(filterdSites)
        }
    }

    function changeZoomLevel(dataFromMapZoomControl) {
        let { name } = dataFromMapZoomControl
        if (name === SmartMapOperations.MAP_RESET) {
            HOME_MAP.fitBounds(siteClusterGroup.getBounds(), { padding: [200, 200] })
        } else if (name === SmartMapOperations.ZOOM_IN) {
            let mapCenter = [HOME_MAP.getCenter().lat, HOME_MAP.getCenter().lng]
            let currentZoomLevel = HOME_MAP.getZoom() + 0.5
            HOME_MAP.setView(mapCenter, currentZoomLevel)
        } else if (name === SmartMapOperations.ZOOM_OUT) {
            let mapCenter = [HOME_MAP.getCenter().lat, HOME_MAP.getCenter().lng]
            let currentZoomLevel = HOME_MAP.getZoom() - 0.5
            HOME_MAP.setView(mapCenter, currentZoomLevel)
        }
    }

    function updateAlarmStatus(value, enabled) {
        if (enabled) {
            if (!condition.includes(value)) {
                console.log('value', value);
                let updatedArray = condition
                updatedArray.push(value)
                setCondition(updatedArray)
                let filterdSites = apps?.filter(site => updatedArray.includes(site.alarm_status))
                plotSites(filterdSites)
            }
        } else {
            let updatedCondition = condition.filter(e => e !== value)
            setCondition(updatedCondition)
        }
    }

    function updateRunningStatus(value, enabled) {
        if (enabled) {
            if (!running.includes(value)) {
                let updatedArray = running
                updatedArray.push(value)
                setRunning(updatedArray)
                let filterdSites = apps.filter(site => updatedArray.includes(site.running_status))
                plotSites(filterdSites)
            }
        } else {
            let updatedCondition = running.filter(e => e !== value)
            setRunning(updatedCondition)
        }
    }

    function updateConnectedStatus(value, enabled) {
        if (enabled) {
            if (!connection.includes(value)) {
                let updatedArray = connection
                updatedArray.push(value)
                setConnection(updatedArray)
                let filterdSites = apps.filter(site => updatedArray.includes(site.device_connection))
                plotSites(filterdSites)

            }
        } else {
            let updatedCondition = connection.filter(e => e !== value)
            setConnection(updatedCondition)
        }
    }

    function plotNetworksOnMap() {
        let parameters = {
            params: { ownerid: Cookies.get('currentOwnerId') }
        }
return;
        DataService.getDataByParams(`map/data/${Cookies.get('currentOwnerId')}`, parameters, response => {
            let networks = response.data.data

            setNetworkData(networks)
            let wasteWaterNetworksGeoData = networks.wasteWater
            let pressurePipeNetworksGeoData = networks.pressurePipe
            let combinedPipeNetworksGeoData = networks.combinedPipe
            let drainageNetworksGeoData = networks.drainage

            if (pressurePipeNetworksGeoData) {
                pressurePipeNetworksLayer.clearLayers()
                //drawNetworkLayer(pressurePipeNetworksGeoData, pressurePipeNetworksLayer, '#ebae13')
            }
            if (drainageNetworksGeoData) {
                drainageNetworksLayer.clearLayers()
                drawNetworkLayer(drainageNetworksGeoData, drainageNetworksLayer, '#31a462')
            }

            if (combinedPipeNetworksGeoData) {
                combinedPipeNetworksLayer.clearLayers()
                //drawNetworkLayer(combinedPipeNetworksGeoData, combinedPipeNetworksLayer, '#5fb5c0')
            }
            if (wasteWaterNetworksGeoData) {
                wasteWaterNetworksLayer.clearLayers()
                //drawNetworkLayer(wasteWaterNetworksGeoData, wasteWaterNetworksLayer, '#5fb5c0')
            }


        }, errorResponse => {
            console.warn(errorResponse.message)
        })









    }

    function drawNetworkLayer(geoData, networkLayer, color) {
        let opacity = 0.9
        let weight = 3
        let maxPipeFilling = 1.5

        let params = {
            params: {
                owner_Id: Cookies.get('currentOwnerId'),
                pipe_data_type: 0,
                frequency: 1,
                start_time: 1660064940,
                end_time: 1660064940,
                scenario_Id: '1a4412ed-669b-43fd-8e22-704cf47ebe5b'
            }
        }

        DataService.getDataByParams('result/network/dynamic', params, response => {
            let data = response.data
            let idArray = data.data.iDs
            let dynamicData = data.data.data
            let updatedGeoData = []

            geoData.forEach((value, index) => {
                value.geometries.forEach((dt, indx) => {
                    idArray.forEach((id, ind) => {
                        if (id.split(',')[0] === dt.pipe_id) {
                            dt['pipe_fill'] = dynamicData[ind]
                        }
                    })
                })
            })

            geoData.forEach((waterNetwork, index) => {
                waterNetwork.geometries.forEach((geometryData, index) => {

                    geometryData.geometry.coordinates = JSON.parse(geometryData.geometry.coordinates)
                    L.geoJson(geometryData, {
                        color: getManholeColor(geometryData.pipe_fill, maxPipeFilling),
                        //color: '#5fb5c0',
                        weight: weight,
                        opacity: opacity,
                        zIndex: 1,
                        onEachFeature: (feature, layer) => {
                            layer.on('click', (e) => {
                                //let popup = e.target.getPopup()
                                let pipeID = geometryData.pipe_id[0]
                                console.log('Pipe ID: ' + pipeID)
                                console.log('Start Point: ' + geometryData.start_point_name[0])
                                setSelectedPipeId(pipeID)
                            })
                        }
                    }).addTo(networkLayer)
                })
            })


        })



        HOME_MAP.addLayer(networkLayer)
        return networkLayer
    }

    function plotVideoCameras() {

        let myIcon = L.icon({
            iconUrl: Camera,
            iconSize: [24, 24]
        })

        DataService.getData(`api/owner/${Cookies.get('currentOwnerId')}/map/cameras`, response => {
            let videoCameras = response.data.data
            console.log(videoCameras.length)
            videoCameras.forEach(videoCamera => {
                let marker = L.marker(
                    L.latLng(parseFloat(videoCamera.latitude),
                        parseFloat(videoCamera.longitude)),
                    { icon: myIcon }
                ).addTo(videoCameraLayer)
            })

        }, errorResponse => {
            console.warn(errorResponse.message)
        })
    }

    function plotZoneOutline(zone) {
        let outline = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": JSON.parse(zone.zone_outline || "[]")

                    },
                    "properties": {
                        "zoneId": zone.zone_id,
                        "zoneName": zone.zone_name,
                        "zoneNameZh": zone.zone_chinese_name,
                    }
                }
            ]
        }

        outline.features.forEach((v, k) => {
            L.geoJSON(v, {
                style: function (feature) {
                    return defaultStyle
                },
                onEachFeature: (feature, layer) => {
                    layer.on('preclick', (e) => {
                        layer.setStyle(defaultStyle)
                    })
                    layer.on('click', (e) => {
                        if (mapType === 'monitoring') {
                            setPage('zone')
                            chooseSize('half')
                        }

                        if (window.lastClickedZone != null) {
                            window.lastClickedZone.setStyle(defaultStyle)
                        }

                        layer.setStyle({ fillColor: '#114471', fillOpacity: 0.5, weight: 0 })
                        setLastClickedZone(layer)
                        setSelectedZoneId(feature.properties.zoneId)
                        setSelectedPSid(null)
                        window.lastClickedZone = layer
                    })
                    layer.on('mousemove', (e) => {
                        layer.setStyle({ color: '#18a0fb', opacity: '1', weight: '3' })
                    })
                    layer.on('mouseout', (e) => {
                        if (selectedZoneId === feature.properties.zoneId) {
                            layer.setStyle({ color: '#767A84', opacity: 0.3, fillColor: '#114471', fillOpacity: '0.7', weight: 0 })
                        } else {
                            layer.setStyle({ opacity: 0.3, weight: 0 })
                        }
                    })
                }
            }).addTo(zoneOutlineLayer)
        })
        HOME_MAP.addLayer(zoneOutlineLayer)
    }

    function selectDeviceFromTopNav(type, deviceId) {
        console.log('type', type);
        console.log('deviceId', deviceId);
        if (chooseSizeOff) {
            chooseSize('half')
        }

        if (type === 'zone') {
            setPage('zone')
            setSelectedZoneId(deviceId)

        } else if (type === 'site') {
            setPage('site')
            setSelectedPSid(deviceId)

        } else if (type === 'pump') {
            setPage('pump')
            setSelectedPumpId(deviceId)

        }

    }

    function drawWaterLogging() {
        let _data = [
            {
                "id": 1,
                "title": "Waterlogging 2",
                "border": "[[30.038, 120.867], [30.036, 120.874], [30.032, 120.877], [30.030, 120.873], [30.032, 120.869]]",
            },
            {
                "id": 2,
                "title": "Waterlogging 3",
                "border": "[[30.036,120.893],[30.036,120.896],[30.034,120.896],[30.034,120.893]]",
            }
        ]

        _data.forEach(waterloggingPoint => {
            if (waterloggingPoint.border !== '') {
                console.log(666, JSON.parse(waterloggingPoint.border));
                let wlPoint = L.polygon(JSON.parse(waterloggingPoint.border), { color: '#ffffff', weight: 2, zIndex: 2 })
                    .bindTooltip(waterloggingPoint.title, { permanent: false, direction: "top" })

                wlPoint.on('click', (e) => {
                    setSelectedWLId(waterloggingPoint.id)
                })

                waterLoggingLayer.addLayer(wlPoint)
            }
        })

        HOME_MAP.addLayer(waterLoggingLayer)

    }

    function drawFlowDirection() {
        HOME_MAP.removeLayer(flowDirectionLayer)
        flowDirectionLayer.clearLayers()
        flowDirectionLayer = L.layerGroup()
        let flowDirectionData = getRealStraightFlowDirectionData()

        let flowDirectionOptionsWW = {
            use: L.polyline,
            delay: 5000,
            pulseColor: '#5fb5c0',
            weight: 2,
            color: 'transparent',
            fillOpacity: 1,
            opacity: 1,
            dashArray: [5, 5],
        }

        let flowDirectionOptionsPP = {
            use: L.polyline,
            delay: 1000,
            pulseColor: '#5fb5c0',
            weight: 3,
            color: 'transparent',
            fillOpacity: 1,
            opacity: 1,
            dashArray: [15, 15],
        }
        let flowDirectionOptions = {
            use: L.polyline,
            delay: 2500,
            pulseColor: '#5fb5c0',
            weight: 3,
            color: '#5fb5c0',
            fillOpacity: 1,
            opacity: 1,
            dashArray: [15, 15],
        }
        flowDirectionData.forEach((data, index) => {
            let options = data.type === 'WW' ? flowDirectionOptionsWW : (data.type === 'PP' ? flowDirectionOptionsPP : flowDirectionOptions)
            let antPolyline = L.polyline.antPath(data.value, options)
            flowDirectionLayer.addLayer(antPolyline)
        })
    }


    function updateMapLayers(data) {
        if (HOME_MAP !== null) {
            if (data.name === 'gravityNetwork') {
                if (data.value) {
                    HOME_MAP.addLayer(wasteWaterNetworksLayer)
                    HOME_MAP.addLayer(drainageNetworksLayer)
                    HOME_MAP.addLayer(combinedPipeNetworksLayer)
                } else {
                    HOME_MAP.removeLayer(wasteWaterNetworksLayer)
                    HOME_MAP.removeLayer(drainageNetworksLayer)
                    HOME_MAP.removeLayer(combinedPipeNetworksLayer)
                }

            } else if (data.name === 'pressureNetwork') {
                if (data.value) {
                    HOME_MAP.addLayer(pressurePipeNetworksLayer)
                } else {
                    HOME_MAP.removeLayer(pressurePipeNetworksLayer)
                }
            } else if (data.name === 'ps') {
                if (data.value) {
                    updateSiteTypes('PUMP STATION', data.value)
                } else {
                    updateSiteTypes('PUMP STATION', data.value)
                }
            } else if (data.name === 'gate') {
                if (data.value) {

                } else {

                }
            } else if (data.name === 'level') {
                if (data.value) {
                    updateSiteTypes('WATER LEVEL SENSOR', data.value)
                } else {
                    updateSiteTypes('WATER LEVEL SENSOR', data.value)
                }
            } else if (data.name === 'pressure') {
                if (data.value) {
                    updateSiteTypes('PRESSURE SENSOR', data.value)
                } else {
                    updateSiteTypes('PRESSURE SENSOR', data.value)
                }
            } else if (data.name === 'flow') {
                if (data.value) {
                    updateSiteTypes('FLOW SENSOR', data.value)
                } else {
                    updateSiteTypes('FLOW SENSOR', data.value)
                }
            } else if (data.name === 'video') {
                if (data.value) {
                    plotVideoCameras()
                } else {
                    videoCameraLayer.clearLayers()
                }
            } else if (data.name === 'plain') {
                HOME_MAP.removeLayer(getBaseLayers().Satelite)
                HOME_MAP.addLayer(getBaseLayers().Default)
            } else if (data.name === 'sat') {
                HOME_MAP.removeLayer(getBaseLayers().Default)
                HOME_MAP.addLayer(getBaseLayers().Satelite)
            } else if (data.name === 'zone') {
                zoneOutlineLayer.clearLayers()
                if (data.value) {
                    zones && zones.forEach(zone => {
                        plotZoneOutline(zone)
                    })
                }

            } else if (data.name === 'waterLogging') {
                waterLoggingLayer.clearLayers()
                if (data.value) {
                    drawWaterLogging()
                }

            } else if (data.name === 'sites') {
                let filterdSites = apps.filter(site => data.value.includes(site.app_id))
                plotSites(filterdSites)
            } else if (data.name === 'sensors') {
                let filterdSites = apps.filter(site => data.value.includes(site.app_id))
                plotSites(filterdSites)
            } else if (data.name === 'zones') {
                let filterdZones = zones.filter(zone => data.value.includes(zone.zone_id))
                zoneOutlineLayer.clearLayers()
                filterdZones.forEach(zone => {
                    plotZoneOutline(zone)
                })
            } else if (data.name === 'allZones') {
                zoneOutlineLayer.clearLayers()
                if (data.value) {
                    zoneOutlineLayer.clearLayers()
                    zones && zones.forEach(zone => {
                        plotZoneOutline(zone)
                    })
                }
            } else if (data.name === 'allSensors') {
                let list = []
                if (data.value) {
                    list = apps
                } else {
                    list = apps.filter(s => !([AppTypes.PRESSURE_SENSOR, AppTypes.FLOW_SENSOR, AppTypes.WL_SENSOR].includes(s.app_type_id)))
                }
                plotSites(list)
            } else if (data.name === 'allSites') {
                let list = []
                if (data.value) {
                    list = apps
                } else {
                    list = apps.filter(s => s.app_type_id !== AppTypes.PUMP_STATION)
                }
                plotSites(list)
            } else if (data.name === 'statusOk') {
                updateAlarmStatus('NORMAL', data.value)
            } else if (data.name === 'statusWarning') {
                updateAlarmStatus('WARNING', data.value)
            } else if (data.name === 'statusAlarm') {
                updateAlarmStatus('ALARM', data.value)
            } else if (data.name === 'statusRunning') {
                updateRunningStatus('RUNNING', data.value)
            } else if (data.name === 'statusNotRunning') {
                updateRunningStatus('NOT_RUNNING', data.value)
            } else if (data.name === 'statusConnected') {
                updateConnectedStatus('CONNECTED', data.value)
            } else if (data.name === 'statusOffline') {
                updateConnectedStatus('NOT_CONNECTED', data.value)
            } else if (data.name === 'mapType') {
                setMapType(data.value)
                // if (data.value !== 'monitoring') {
                onOff()
                // }
                if (data.value == 'energy') {
                    HOME_MAP.removeLayer(combinedPipeNetworksLayer)
                    HOME_MAP.removeLayer(pressurePipeNetworksLayer)
                    HOME_MAP.removeLayer(wasteWaterNetworksLayer)
                    HOME_MAP.removeLayer(drainageNetworksLayer)

                    plotPumpStationsWithEnergy()
                }
            } else if (data.name === 'flood-depth') {
                setFloodDepth(data.value)
                if (data.value) {
                    HOME_MAP.addLayer(heatMapLayer)
                    // HOME_MAP.removeLayer(combinedPipeNetworksLayer)
                    // HOME_MAP.removeLayer(pressurePipeNetworksLayer)
                    // HOME_MAP.removeLayer(wasteWaterNetworksLayer)
                    // HOME_MAP.removeLayer(drainageNetworksLayer)
                } else {
                    if (HOME_MAP !== null) {
                        HOME_MAP.removeLayer(heatMapLayer)
                        // HOME_MAP.addLayer(combinedPipeNetworksLayer)
                        // HOME_MAP.addLayer(pressurePipeNetworksLayer)
                        // HOME_MAP.addLayer(wasteWaterNetworksLayer)
                        // HOME_MAP.addLayer(drainageNetworksLayer)
                    }


                }
            } else if (data.name === 'pipe-max-discharge') {
                // setShowDischarge(data.value)
                if (data.value) {
                    if (HOME_MAP !== null) {
                        HOME_MAP.addLayer(combinedPipeNetworksLayer)
                        // HOME_MAP.addLayer(pressurePipeNetworksLayer)
                        HOME_MAP.addLayer(wasteWaterNetworksLayer)
                        HOME_MAP.addLayer(drainageNetworksLayer)
                    }
                } else {
                    if (HOME_MAP !== null) {
                        HOME_MAP.removeLayer(combinedPipeNetworksLayer)
                        HOME_MAP.removeLayer(pressurePipeNetworksLayer)
                        HOME_MAP.removeLayer(wasteWaterNetworksLayer)
                        HOME_MAP.removeLayer(drainageNetworksLayer)

                    }


                }
            } else if (data.name === 'flood-trends') {
                if (data.value) {
                    HOME_MAP.removeLayer(combinedPipeNetworksLayer)
                    HOME_MAP.removeLayer(pressurePipeNetworksLayer)
                    HOME_MAP.removeLayer(wasteWaterNetworksLayer)
                    HOME_MAP.removeLayer(drainageNetworksLayer)
                }
            } else if (data.name === 'flood-conditions') {
                if (data.value) {
                    HOME_MAP.removeLayer(combinedPipeNetworksLayer)
                    HOME_MAP.removeLayer(pressurePipeNetworksLayer)
                    HOME_MAP.removeLayer(wasteWaterNetworksLayer)
                    HOME_MAP.removeLayer(drainageNetworksLayer)
                    plotStations()
                } else {
                    HOME_MAP.removeLayer(conditionIconLayer)
                }
            } else if (data.name === 'flood-rules') {
                if (data.value) {
                    setFloodRules(true)
                    plotSitesOnly(apps)
                    HOME_MAP.addLayer(flowDirectionLayer)
                    HOME_MAP.addLayer(siteClusterGroup)
                    HOME_MAP.removeLayer(combinedPipeNetworksLayer)
                    HOME_MAP.removeLayer(pressurePipeNetworksLayer)
                    HOME_MAP.removeLayer(wasteWaterNetworksLayer)
                    HOME_MAP.removeLayer(drainageNetworksLayer)
                } else {
                    setFloodRules(false)
                    HOME_MAP.removeLayer(flowDirectionLayer)
                    HOME_MAP.removeLayer(siteClusterGroup)
                    if (showDischarge) {
                        HOME_MAP.addLayer(combinedPipeNetworksLayer)
                        // HOME_MAP.addLayer(pressurePipeNetworksLayer)
                        HOME_MAP.addLayer(wasteWaterNetworksLayer)
                        HOME_MAP.addLayer(drainageNetworksLayer)
                    }

                }
            } else if (data.name === 'pump_station') {
                if (data.value) {
                    plotSitesOnly(apps)
                    HOME_MAP.addLayer(siteClusterGroup)
                } else {
                    if (siteClusterGroup !== null) {
                        HOME_MAP.removeLayer(siteClusterGroup)
                    }
                }
            } else if (data.name === 'simulator-compare') {
                if (data.value) {
                    onClickCompare()
                } else {
                    onClickCompare()
                }
            } else if (data.name === 'showKeyBoard') {
                if (data.value) {
                    onShowKeyBoard()
                } else {
                    onShowKeyBoard()
                }
            } else if (data.name === 'compareZoomLevel') {
                setCompareMapZoomLevel(parseFloat(data.value))
            } else if (data.name === 'compareCenter') {
                setCompareMapCenter(data.value)
            } else if (data.name === 'iot-pipe-sites-layer') {
                // clear up first
                if (HOME_MAP !== null) {
                    HOME_MAP.removeLayer(IOTPipeSitesLayer)
                }

                IOTPipeSitesLayer.clearLayers()
                // a special pipeline layer for water quality tracing
                // use the same color for all pipes, same as `drawNetworkLayer` in `CustomSmartMap.js`
                if (data.value && data.value.layer) {

                    IOTPipeSitesLayer.addLayer(data.value.layer)
                    if (HOME_MAP !== null) {
                        HOME_MAP.addLayer(IOTPipeSitesLayer)
                    }
                }

                // also clear the energy layer
                HOME_MAP.removeLayer(siteClusterGroup)
                // clear memory
                data.value = null

            } else if (data.name === 'quality-monitor') {
                // water quality pages, switch map layers, show sites icons

                if (data.map_center) {
                    // coords of a water processing plant, used by water quality tracing
                    // center of ShangYu, used by all other maps
                    HOME_MAP.setView(data.map_center, data.map_scale)
                }

                if (data.value) {
                    if (data.value.length == 1) {
                        // also swith the statistics cards
                        setWaterQualityLayer(data.value[0]);

                        // also disable selected map ico
                        setWaterQualityMapIcon({})
                    }

                    // toggle among the layers of Water quality monitoring
                    Object.entries(waterQualityMonitoringLayers).forEach(([k, l]) => {

                        if (data.value.indexOf(k) != -1) {
                            HOME_MAP.addLayer(l)
                        } else {
                            HOME_MAP.removeLayer(l)
                        }
                    })
                } else {

                    // remove all layers when unmount in `WaterQualityMonitor`
                    Object.entries(waterQualityMonitoringLayers).forEach(([_, l]) => {
                        HOME_MAP.removeLayer(l)
                    })
                }

                // also clear the energy layer
                HOME_MAP.removeLayer(siteClusterGroup)

            } else if (data.name === 'pipeline-highlight') {
                // for water quality tracing, show highlight pipes in an area, 
                // based on pipes connectivity

                // clear up first
                if (HOME_MAP !== null) {
                    HOME_MAP.removeLayer(networkHighlightLayer)
                }
                networkHighlightLayer.clearLayers()

                // maplayer for highlighting pipeline networks
                if (data.value && data.value.layer) {

                    networkHighlightLayer.addLayer(data.value.layer)
                    HOME_MAP.addLayer(networkHighlightLayer)
                    // remove original pipline layers
                    HOME_MAP.removeLayer(lightColorPipelineNetworkLayer)
                } else {

                    // restore original pipline layers
                    HOME_MAP.addLayer(lightColorPipelineNetworkLayer)
                }
                // clear memory
                data.value = null
            } else if (data.name === 'connect-site') {
                // draw dashed lines between sites

                // clear up first
                if (HOME_MAP !== null) {
                    HOME_MAP.removeLayer(connectedSitesLayer)
                }
                connectedSitesLayer.clearLayers()

                if (data.value && data.value.layer) {

                    HOME_MAP.removeLayer(connectedSitesLayer)
                    connectedSitesLayer.clearLayers()

                    connectedSitesLayer.addLayer(data.value.layer);
                    HOME_MAP.addLayer(connectedSitesLayer)
                }

                // clear memory
                data.value = null
            }
        }


    }

    function plotStations() {

        let stationIcon = L.icon({
            iconUrl: HydroStationIcon,
            iconSize: [30, 30]
        })

        // 1
        L.marker(
            L.latLng(30.00574287944782, 120.8593760748033),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)

        L.marker(
            L.latLng(30.05090833034782, 120.86560166654935),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)

        L.marker(
            L.latLng(30.04877901794715, 120.87081129627835),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)

        L.marker(
            L.latLng(30.034216852993513, 120.8935283735906),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)

        L.marker(
            L.latLng(30.028442486270006, 120.9045447184112),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)



        // 2
        L.marker(
            L.latLng(30.053864627999452, 120.87052023756328),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)

        L.marker(
            L.latLng(30.035204383831736, 120.90137586956585),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)

        L.marker(
            L.latLng(30.00976956998015, 120.87580373619384),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)

        L.marker(
            L.latLng(30.028983521403227, 120.84093264523206),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)

        L.marker(
            L.latLng(30.031728067665643, 120.86946353783716),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)



        // 3 4
        L.marker(
            L.latLng(30.026006899968607, 120.85633012155785),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)

        L.marker(
            L.latLng(30.01670733688211, 120.87090654524945),
            { icon: stationIcon }
        ).addTo(conditionIconLayer)


        HOME_MAP.addLayer(conditionIconLayer)


    }

    /**
     * draw pipeline network map layer with color #5fb5c0
     * `lightColorPipelineNetworkLayer` is to store this map layer, for addLayer/clearLayers
     */
    function drawLightColorPipelineNetworkLayer() {

        // console.log('build drawLightColorPipelineNetworkLayer')

        lightColorPipelineNetworkLayer = L.layerGroup()

        // all the pipes for display
        const allPipes = PipelineData.combinedPipe[0].geometries.concat(PipelineData.wasteWater[0].geometries)

        const color = '#5fb5c0';

        // this iteration, get pipes close to the target site
        allPipes.forEach((geometryData) => {
            // it's pseudo data, PipelineData has been updated, so don't parse again
            if (typeof geometryData.geometry.coordinates !== 'object') {
                geometryData.geometry.coordinates = JSON.parse(geometryData.geometry.coordinates)
            }

            L.geoJson(geometryData, {
                color: color,
                weight: 3,
                opacity: 0.6,
                zIndex: 1,
            }).addTo(lightColorPipelineNetworkLayer)
        })
    }
}

