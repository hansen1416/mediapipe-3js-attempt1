import L from 'leaflet/dist/leaflet-src'
import T, { tt } from '../locales/lang'
import React, { Component } from 'react';

import { ReactComponent as WeatherIconBrokenClouds } from '../assets/weather-icons/cloudy.svg'
import { ReactComponent as WeatherIconClear } from '../assets/weather-icons/sunny.svg'
import { ReactComponent as WeatherIconThunder } from '../assets/weather-icons/storm.svg'
import { ReactComponent as WeatherIconDrizzle } from '../assets/weather-icons/partiallyCloudyRainy.svg'
import { ReactComponent as PartiallyCloudyMoon } from '../assets/weather-icons/partiallyCloudyMoon.svg'
import { ReactComponent as WeatherIconClearSkyNight } from '../assets/weather-icons/clearSkyNight.svg'
import { ReactComponent as WeatherIconFewClouds } from '../assets/weather-icons/partiallyCloudy.svg'
import { ReactComponent as WeatherIconRain } from '../assets/weather-icons/rain.svg'
import { ReactComponent as WeatherIconSnow } from '../assets/weather-icons/snow.svg'
import { ReactComponent as NightRain } from '../assets/weather-icons/nightRain.svg'
import { ReactComponent as WeatherIconCloudy } from '../assets/weather-icons/overcast.svg'

import ApplicationOnline from '../assets/map-svg/ApplicationOnline.svg'
import ApplicationOffline from '../assets/map-svg/ApplicationOffline.svg'
import ApplicationWarning from '../assets/map-svg/ApplicationWarning.svg'
import ApplicationAlarm from '../assets/map-svg/ApplicationAlarm.svg'
import ApplicationRunning from '../assets/map-svg/ApplicationRunning.svg'
import ApplicationRunningWithAlarm from '../assets/map-svg/ApplicationRunningWithAlarm.svg'
import ApplicationRunningWithWarning from '../assets/map-svg/ApplicationRunningWithWarning.svg'

import WaterLevelSensorOnline from '../assets/sensors/water-level-sensor/WaterLevelSensorOnline.svg'
import WaterLevelSensorOffline from '../assets/sensors/water-level-sensor/WaterLevelSensorOffline.svg'
import WaterLevelSensorAlarm from '../assets/sensors/water-level-sensor/WaterLevelSensorAlarm.svg'
import WaterLevelSensorWarning from '../assets/sensors/water-level-sensor/WaterLevelSensorWarning.svg'

import FlowSensorOnline from '../assets/sensors/flow-sensor/FlowSensorOnline.svg'
import FlowSensorOffline from '../assets/sensors/flow-sensor/FlowSensorOffline.svg'
import FlowSensorAlarm from '../assets/sensors/flow-sensor/FlowSensorAlarm.svg'
import FlowSensorWarning from '../assets/sensors/flow-sensor/FlowSensorWarning.svg'

import PressureSensorOnline from '../assets/sensors/pressure-sensor/PressureSensorOnline.svg'
import PressureSensorOffline from '../assets/sensors/pressure-sensor/PressureSensorOffline.svg'
import PressureSensorAlarm from '../assets/sensors/pressure-sensor/PressureSensorAlarm.svg'
import PressureSensorWarning from '../assets/sensors/pressure-sensor/PressureSensorWarning.svg'

import Online from '../assets/images/site-online.png'
import Offline from '../assets/images/site-offline.png'
import Running from '../assets/images/siteRunning.gif'
import Warning from '../assets/images/site-warning.png'
import Alarmed from '../assets/images/site-alarm.png'

import { AppTypes } from '../constants'

// the following are site icons for for water contanamination tracing demo
import SewagePlant from '../assets/map-svg/sewagePlant.svg'
import SewageStation from '../assets/map-svg/sewageStation.svg'
import SewageYellowAlarm from '../assets/map-svg/sewageYellowAlarm.svg'
import waterQuality1 from '../assets/map-svg/waterQuality1.svg'
import waterQuality2 from '../assets/map-svg/waterQuality2.svg'
import waterQuality3 from '../assets/map-svg/waterQuality3.svg'
import waterQuality4 from '../assets/map-svg/waterQuality4.svg'
import waterQuality5 from '../assets/map-svg/waterQuality5.svg'
import waterQualityAlarm1 from '../assets/map-svg/waterQualityAlarm1.svg'
import waterQualityAlarm2 from '../assets/map-svg/waterQualityAlarm2.svg'
import waterQualityAlarm3 from '../assets/map-svg/waterQualityAlarm3.svg'
import waterQualityAlarm4 from '../assets/map-svg/waterQualityAlarm4.svg'
import waterQualityAlarm5 from '../assets/map-svg/waterQualityAlarm5.svg'

// Create map object using div id and parameters.
export function getMapObject(divId, parameters) {
    let smartMap = L.map(divId, parameters || { preferCanvas: true, attributionControl: false, zoomSnap: 1 })
    {
        let locationsArray = []
        smartMap.on('contextmenu', (e) => {
            let { lng: x, lat: y } = e.latlng
            locationsArray.push([x, y])
            console.log([y, x])
        })
        global.myArrXy = locationsArray
    }
    let baseLayers = getBaseLayers()
    smartMap.addLayer(baseLayers.Default)
    smartMap.setView([30.022234854301942, 120.88861297401787], 13.84)
    return smartMap
}


/**
 * Get status of all pumps in the app
 * @param {*} appId 
 * @param {*} cbSuccess 
 * @param {*} cbFailure 
 */
export function getSiteClassName(markers) {
    let className = 'marker-normal'

    let offline = 0
    let online = 0
    let runningNormal = 0
    let warning = 0
    let alarm = 0

    for (let i = 0; i < markers.length; i++) {
        let alarmStatus = markers[i].options.alarm_status
        let runningStatus = markers[i].options.running_status
        let connectionStatus = markers[i].options.connection_status

        if (connectionStatus === 'NOT_CONNECTED') { offline += 1 }
        if (connectionStatus === 'CONNECTED') {
            online += 1
            if (runningStatus === 'RUNNING') { runningNormal += 1 }
            if (alarmStatus === 'WARNING') { warning += 1 }
            if (alarmStatus === 'ALARM') { alarm += 1 }
        }

    }

    if (offline > 0) {
        className = 'marker-offline'
    } if (online > 0) {
        className = 'marker-normal'
    } if (runningNormal > 0) {
        className = 'marker-running-normal'
    } if (warning > 0) {
        className = 'marker-running-warning'
    } if (alarm > 0) {
        className = 'marker-running-alarm'
    }

    /*
        if (runningWithAlarm > 0) {
            className = 'marker-running-alarm'
        } else if (runningWithWarning > 0) {
            className = 'marker-running-warning'
        } else if (notRunningWithAlarm > 0) {
            className = 'marker-standby-alarm'
        } else if (notRunningWithWarning > 0) {
            className = 'marker-standby-warning'
        } else if (runningNormal === total) {
            className = 'marker-running-normal'
        } else if (offline === total) {
            className = 'marker-offlineline'
        }*/

    return className
}

export function getNewMarkerClusterGroup() {
    return L.markerClusterGroup({
        maxClusterRadius: 30,
        iconCreateFunction: function (cluster) {
            let markers = cluster.getAllChildMarkers()
            let className = getSiteClassName(markers)
            return L.divIcon({ html: markers.length, className: className, iconSize: L.point(40, 40) })
        },
    })
}

export function getBaseLayers() {
    return {
        'Default': L.bingLayer({
            key: process.env.REACT_APP_BING_MAP_KEY,
            imagerySet: process.env.REACT_APP_BING_MAP_IMAGERY_SET_CANVAS_DARK,
            culture: 'en-US',
            style: process.env.REACT_APP_BING_MAP_STYLE_DARK
        }),
        'Chinese': L.bingLayer({
            key: process.env.REACT_APP_BING_MAP_KEY,
            imagerySet: process.env.REACT_APP_BING_MAP_IMAGERY_SET_CANVAS_DARK,
            culture: 'zh-CN',
            style: process.env.REACT_APP_BING_MAP_STYLE_DARK
        }),
        'Satelite': L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {
            //maxZoom: 18,
            minZoom: 5
        }),
        'BlackRiver': L.bingLayer({
            key: process.env.REACT_APP_BING_MAP_KEY,
            imagerySet: process.env.REACT_APP_BING_MAP_IMAGERY_SET_CANVAS_DARK,
            culture: 'en-US',
            style: process.env.REACT_APP_BING_MAP_STYLE_BLACK_RIVER
        }),
        'BlackRiverChinese': L.bingLayer({
            key: process.env.REACT_APP_BING_MAP_KEY,
            imagerySet: process.env.REACT_APP_BING_MAP_IMAGERY_SET_CANVAS_DARK,
            culture: 'zh-CN',
            style: process.env.REACT_APP_BING_MAP_STYLE_BLACK_RIVER
        }),
    }
}

export function getWeatherIcon(status, sub, iconUrl) {
    let icon = WeatherIconBrokenClouds
    if (status === 'Clear') {
        icon = WeatherIconClear
        if (iconUrl.indexOf('01n') > -1) {
            icon = WeatherIconClearSkyNight
        }
    } else if (status === 'Clouds') {
        icon = WeatherIconCloudy
        if (sub && sub === 'few clouds') {
            icon = WeatherIconFewClouds
            if (iconUrl.indexOf('02n') > -1) {
                icon = PartiallyCloudyMoon
            }
        } else if (sub && sub === 'scattered clouds') {
            icon = WeatherIconCloudy
        } else if (sub && sub === 'broken clouds') {
            icon = WeatherIconBrokenClouds
        }
    } else if (status === 'Thunderstorm') {
        icon = WeatherIconThunder
    } else if (status === 'Drizzle') {
        icon = WeatherIconDrizzle
    } else if (status === 'Rain') {
        icon = WeatherIconRain
        if (sub === 'light rain' || sub === 'moderate rain') {
            icon = WeatherIconDrizzle
        }
        if (iconUrl && iconUrl.indexOf('10n') > -1) {
            icon = NightRain
        }
    } else if (status === 'Snow') {
        icon = WeatherIconSnow
    }
    return icon
}

export function getFlowDirectionData() {
    let data = [
        {
            name: 'Hengli',
            value: [[30.027271437123897, 120.87791405618192], [30.025128751607298, 120.87630881819011], [30.043027045249904, 120.840557590127]],
        },
        {
            name: 'SouthCity',
            value: [[29.995755611653284, 120.87987005710603], [30.043027045249904, 120.840557590127]],
        },
        {
            name: 'NorthCity',
            value: [[30.03195757145435, 120.85317872464658], [30.043027045249904, 120.840557590127]],
        },
        {
            name: 'Lianghu Center',
            value: [[[29.990092052021993, 120.89823246002197], [30.025841078027337, 120.90449609044084]]],
        },
        {
            name: 'Ludong',
            value: [[[30.025841078027337, 120.90449609044084], [30.03845182183296, 120.88910990840216], [30.04162789890901, 120.86642263443596], [30.043027045249904, 120.840557590127]]],
        },
        {
            name: 'Niyuan',
            value: [[29.98033460231013, 120.9056829661131], [29.990092052021993, 120.89823246002197]],
        },
        {
            name: 'Yushui',
            value: [[29.978054236266292, 120.91047406196596], [29.981583425428774, 120.91203865427876], [29.990092052021993, 120.89823246002197]],
        },
        {
            name: 'Luze',
            value: [[29.98003198924847, 120.920789167285], [29.990092052021993, 120.89823246002197]],
        },
        {
            name: 'BaiguanSijia',
            value: [[30.047550492798294, 120.85347376763822], [30.040165122292944, 120.85356637366255], [30.040165122292944, 120.85406935106013], [30.039903873068635, 120.85452203071796], [30.038858869282848, 120.8543208397589], [30.038858869282848, 120.85376756462156], [30.038162193969306, 120.85371726688183], [30.038031566802694, 120.8543208397589], [30.037726769410913, 120.85442143523845], [30.036681742664168, 120.85442143523845], [30.036638199643853, 120.85351607592278], [30.031956990926176, 120.85317805409433]],
        },
        {
            name: 'ChengshanRoad',
            value: [[30.037352273099017, 120.85985407233241], [30.036075551159964, 120.85818161084721], [30.035882169858507, 120.85835534969776], [30.03534499759655, 120.85842980920516], [30.035280536729445, 120.858206430683], [30.03549133617427, 120.85758556601895], [30.03195757145435, 120.85317805409433]],
        },
        {
            name: 'Chengdong',
            value: [[30.034178647424167, 120.88724277913572], [30.037148751340506, 120.86384946888748], [30.036574598255243, 120.86399685141251], [30.036447008228972, 120.86355470383744], [30.036670290667153, 120.86303886499982], [30.037353434092186, 120.8598527312279]],
        },
        {
            name: 'HuaweiMiddleSchool',
            value: [[30.035462158176983, 120.88747344911098], [30.038250801993012, 120.86040474836254], [30.037964392132753, 120.86032731661568], [30.03786689071487, 120.8604892193591], [30.03755610430501, 120.86047514085969], [30.037550010444072, 120.86029212036713], [30.037550010444072, 120.85989792238318], [30.037352853595614, 120.8598527312279]],
        },
        {
            name: 'Jiujinfan',
            value: [[30.019432465010638, 120.88746137917042], [30.027839218910856, 120.8969483524561]],
        },
        {
            name: 'RenminRoadEast',
            value: [[30.027839799463152, 120.8969470113516], [30.027878696460178, 120.89688532054426], [30.02787695480393, 120.89689604938032], [30.02788914639708, 120.89690342545511], [30.02789843522896, 120.89689604938032], [30.027899596332887, 120.89688532054426], [30.027911787923237, 120.89686654508115], [30.034178647424167, 120.88724277913572]]
        }
    ]
    return data
}

export function getShanghaiFLowDirectionData() {
    let data = [


        {
            name: 'Sh_PumpStation16',
            value: [[31.19263257419548, 121.27413131296636], [31.19948066923814, 121.26816608011724]],
        },

        {
            name: 'Sh_PumpStation3',
            value: [[31.19948066923814, 121.26816608011724], [31.204351296734373, 121.2662107497454]],
        },

        {
            name: 'Sh_PumpStation19',
            value: [[31.206958000344212, 121.2809843569994], [31.205324015658228, 121.27777911722661]],
        },

        {
            name: 'Sh_PumpStation20',
            value: [[31.205324015658228, 121.27777911722661], [31.206958000344212, 121.2809843569994]],
        },

        {
            name: 'Sh_PumpStation4',
            value: [[31.20125412975983, 121.27448268234733], [31.2059061510314, 121.27228997647764]],
        },



        {
            name: 'Sh_PumpStation18',
            value: [[31.194230641209266, 121.28041975200178], [31.20125412975983, 121.27448268234733]],
        },

        {
            name: 'Sh_PumpStation5',
            value: [[31.19814711056414, 121.28225840628149], [31.205324015658228, 121.27777911722661]],
        },
        {
            name: 'Sh_PumpStation14',
            value: [[31.19651698879619, 121.28893308341505], [31.202050799618654, 121.28535702824594]],
        },

        {
            name: 'Sh_PumpStation8',
            value: [[31.202050799618654, 121.28535702824594], [31.2043576056747, 121.28318242728713]],
        },

        {
            name: 'Sh_PumpStation15',
            value: [[31.2043576056747, 121.28318242728713], [31.206958000344212, 121.2809843569994]],
        },

        {
            name: 'Sh_PumpStation6',
            value: [[31.210011967636778, 121.28986246883869], [31.205293044808933, 121.28882378339769]],
        },

        {
            name: 'Sh_PumpStation7',
            value: [[31.205293044808933, 121.28882378339769], [31.202050799618654, 121.28535702824594]],
        },

        {
            name: 'Sh_PumpStation13',
            value: [[31.197476595897236, 121.30148984491827], [31.198653004712625, 121.29477627575397]],
        },

        {
            name: 'Sh_PumpStation10',
            value: [[31.198653004712625, 121.29477627575397], [31.20384715368663, 121.2964003533125]],
        },

        {
            name: 'Sh_PumpStation11',
            value: [[31.20384715368663, 121.2964003533125], [31.210011967636778, 121.28986246883869]],
        },

        {
            name: 'Sh_PumpStation12',
            value: [[31.186543496558873, 121.29576332867148], [31.187189422001463, 121.28995902836323]],
        },

        {
            name: 'Sh_PumpStation9',
            value: [[31.187189422001463, 121.28995902836323], [31.18782960663438, 121.28486149013044]],
        },

        {
            name: 'Sh_PumpStation17',
            value: [[31.18782960663438, 121.28486149013044], [31.19263257419548, 121.27413131296636]],
        },

    ]
    return data
}

export function getSiteIcon(site, iconSz, cssClassName) {
    let siteIcon = null
    let iconSize = iconSz || [30, 30]
    let className = cssClassName || ''

    if ([AppTypes.FLOW_SENSOR, AppTypes.PRESSURE_SENSOR, AppTypes.WL_SENSOR].includes(site.app_type_id)) {

        if (site.alarm_status === null || site.alarm_status === undefined || site.alarm_status.toUpperCase() === 'NORMAL') {
            siteIcon = L.icon({
                iconUrl: site.app_type_id === AppTypes.FLOW_SENSOR ? FlowSensorOnline : site.app_type_id === AppTypes.PRESSURE_SENSOR ? PressureSensorOnline : site.app_type_id === AppTypes.WL_SENSOR ? WaterLevelSensorOnline : ApplicationOnline,
                iconSize: iconSize
            })
            if (site.device_connection && site.device_connection.toUpperCase() === 'NOT_CONNECTED') {
                siteIcon = L.icon({
                    iconUrl: site.app_type_id === AppTypes.FLOW_SENSOR ? FlowSensorOffline : site.app_type_id === AppTypes.PRESSURE_SENSOR ? PressureSensorOffline : site.app_type_id === AppTypes.WL_SENSOR ? WaterLevelSensorOffline : ApplicationOffline,
                    iconSize: iconSize
                })
            }
        } else if (site.alarm_status.toUpperCase() === 'ALARM') {
            siteIcon = L.icon({
                iconUrl: site.app_type_id === AppTypes.FLOW_SENSOR ? FlowSensorAlarm : site.app_type_id === AppTypes.PRESSURE_SENSOR ? PressureSensorAlarm : site.app_type_id === AppTypes.WL_SENSOR ? WaterLevelSensorAlarm : ApplicationAlarm,
                iconSize: iconSize
            })
        } else if (site.alarm_status.toUpperCase() === 'WARNING') {
            siteIcon = L.icon({
                iconUrl: site.app_type_id === AppTypes.FLOW_SENSOR ? FlowSensorWarning : site.app_type_id === AppTypes.PRESSURE_SENSOR ? PressureSensorWarning : site.app_type_id === AppTypes.WL_SENSOR ? WaterLevelSensorWarning : ApplicationWarning,
                iconSize: iconSize
            })
        }
    } else {
        if (site.alarm_status === null || site.alarm_status === undefined || site.alarm_status.toUpperCase() === 'NORMAL') {
            siteIcon = L.icon({
                iconUrl: ApplicationOnline,
                iconSize: iconSize
            })
            if (site.device_connection && site.device_connection.toUpperCase() === 'NOT_CONNECTED') {
                siteIcon = L.icon({
                    iconUrl: ApplicationOffline,
                    iconSize: iconSize
                })
            }
            if (site.running_status !== undefined && site.running_status.toUpperCase() === 'RUNNING') {
                siteIcon = L.icon({
                    iconUrl: ApplicationRunning,
                    iconSize: iconSize
                })
            }
        } else if (site.alarm_status.toUpperCase() === 'ALARM') {
            siteIcon = L.icon({
                iconUrl: site.running_status.toUpperCase() === 'RUNNING' ? ApplicationRunningWithAlarm : ApplicationAlarm,
                iconSize: iconSize
            })
        } else if (site.alarm_status.toUpperCase() === 'WARNING') {
            siteIcon = L.icon({
                iconUrl: site.running_status.toUpperCase() === 'RUNNING' ? ApplicationRunningWithWarning : ApplicationWarning,
                iconSize: iconSize
            })
        }
        // special logic for water contanamination tracing demo
        // can be removed when the demo is retired
        if (site.water_quality_type) {
            const mapping = {
                1: SewagePlant,
                2: SewageStation,
                3: SewageYellowAlarm,
                4: waterQuality1,
                5: waterQuality2,
                6: waterQuality3,
                7: waterQuality4,
                8: waterQuality5,
                9: waterQualityAlarm1,
                10: waterQualityAlarm2,
                11: waterQualityAlarm3,
                12: waterQualityAlarm4,
                13: waterQualityAlarm5,
            }

            siteIcon = L.icon({
                iconUrl: mapping[parseInt(site.water_quality_type)],
                iconSize: iconSize,
                className: className,
            })
        }
    }

    return siteIcon
}

export function getIcon(application) {
    let icon = Online
    if (application.running_status === 'RUNNING') {
        icon = Running
    }
    if (application.alarm_status === 'ALARM') {
        icon = Alarmed
    } else if (application.alarm_status === 'WARNING') {
        icon = Warning
    }
    if (application.device_connection === 'NOT_CONNECTED') {
        icon = Offline
    }
    return icon
}

export function getRealFlowDirectionData() {
    let data = [
        {
            type: 'WW',
            value: [[30.043186672540468, 120.89368611574174],
            [30.04317158051673, 120.89371025562288],
            [30.042960291943025, 120.89401133358481],
            [30.042936492927094, 120.89405223727229],
            [30.04271823827044, 120.89444652199747],
            [30.042523201787457, 120.89480191469194],
            [30.04248256913854, 120.89496284723285],
            [30.042292175932886, 120.89529879391193],
            [30.04213486907535, 120.89556299149992],
            [30.041957245533723, 120.89589893817903],
            [30.041799938144376, 120.89618124067785],
            [30.041633342961585, 120.89647695422175],
            [30.04146384513615, 120.89678272604942],
            [30.041265323341783, 120.89713275432588]]
        },
        {
            type: 'WW',
            value: [[30.04267992756302, 120.89813590049745],//main-top
            [30.04186785317338, 120.89755721390247],
            [30.04143249961611, 120.89725010097028],
            [30.040961154674648, 120.89691884815693],
            [30.04048458318673, 120.89658156037332],
            [30.040014975178618, 120.89624829590323],
            [30.039572647676756, 120.89593917131427],
            [30.039074011025424, 120.89558444917203],
            [30.038768674654403, 120.89535377919674],
            [30.040972183707506, 120.89035280048847],
            [30.041221787807373, 120.88898688554767],
            [30.0412299144419, 120.888689160347],
            [30.04128738133857, 120.8882559835911],
            [30.04130363459623, 120.8867854624987],
            [30.04133904346975, 120.88599756360055],
            [30.041332077790706, 120.88546112179758],
            [30.041296668914693, 120.88509768247606],
            [30.0411590966042, 120.88403284549715],
            [30.04105693307703, 120.88320538401607],
            [30.040897882830734, 120.88178381323814],
            [30.040814294277794, 120.88100329041482],
            [30.040888595217236, 120.88076524436475],
            [30.040839254755838, 120.88040851056577],
            [30.040762051396364, 120.88002294301988],
            [30.04069587704036, 120.87969169020653],
            [30.040605322586856, 120.87924040853979],
            [30.040571654884307, 120.87897889316083],
            [30.040515348528633, 120.87853699922564],
            [30.040427115824425, 120.87804816663267],
            [30.04037487273885, 120.87762303650379],
            [30.040369067949875, 120.8775868266821],
            [30.04018911932263, 120.87645560503009],
            [30.040113076417384, 120.87566770613195],
            [30.039952283211832, 120.87417237460615],
            [30.039923839621235, 120.87369896471502],
            [30.039929063954812, 120.87333418428899],
            [30.03991339095325, 120.87292782962324],
            [30.03977523623963, 120.87269715964796],
            [30.039779880098695, 120.87219156324865],
            [30.0397258952238, 120.87184824049474],
            [30.039731119567808, 120.87146334350112],
            [30.039736924394187, 120.8708591759205],
            [30.039710802672857, 120.87025366723539],
            [30.039530852850078, 120.86958378553393],
            [30.03938805372584, 120.86837008595468],
            [30.03917675708317, 120.86660251021388],
            [30.039087362214104, 120.86585752665998],
            [30.039032796475144, 120.86502067744733],
            [30.038973586809515, 120.86453519761564],
            [30.038924245394483, 120.86410671472551],
            [30.038658962306513, 120.86201459169389],
            [30.038543444941208, 120.86112007498741],
            [30.03844650312869, 120.86030334234239],
            [30.038223594649136, 120.85931628942491],
            [30.038068022808986, 120.858745649457],
            [30.037740624556474, 120.85782498121264],
            [30.03731047733575, 120.85685268044473],
            [30.03685884976931, 120.8560372889042],
            [30.03631143724745, 120.8552245795727],
            [30.035441840406744, 120.85419930517675],
            [30.03500936116608, 120.85377618670466],
            [30.032262928812298, 120.85200123488904],
            [30.032140765630736, 120.85192476569199],
            [30.031707612172426, 120.85279917732552],
            [30.031835559237102, 120.8528684528951],
            [30.03194484722406, 120.85292541280785]]
        },
        {
            type: 'WW',
            value: [[30.041030811703752, 120.89252069592477],
            [30.040366746034174, 120.89218206703666]]
        },
        {
            type: 'WW',
            value: [[30.045092892745235, 120.88958837091924],
            [30.04471443781534, 120.88951461017133],
            [30.04410844255454, 120.88942341506483],
            [30.043718374678484, 120.88936507701875],
            [30.043245299226225, 120.88929601013663],
            [30.042488954270173, 120.88917933404446],
            [30.042142415166463, 120.88912904262544],
            [30.04180574284954, 120.88907942175865],
            [30.041221787807373, 120.88898688554767]]
        },
        {
            type: 'WW',
            value: [[30.050140948523445, 120.8825455605984],
            [30.049931416084153, 120.88260322809221],
            [30.049632497848034, 120.88268838822843],
            [30.0491420378168, 120.88283121585847],
            [30.0487763678107, 120.88293850421907],
            [30.048285323107386, 120.88307797908784],
            [30.04777976508333, 120.88322818279268],
            [30.04778498900262, 120.88324427604675],
            [30.04780240206496, 120.8833046257496],
            [30.04779253466334, 120.88334687054157],
            [30.04765497137374, 120.88338844478132],
            [30.047635236540142, 120.88335290551188],
            [30.04762130606701, 120.88328987360002],
            [30.047618403884858, 120.88327378034595],
            [30.047345598383092, 120.88335223495963],
            [30.04703854618552, 120.88344074785711],
            [30.046798243801753, 120.88350981473924],
            [30.04648248326139, 120.88360838592055],
            [30.04614234302374, 120.88370360434057],
            [30.045772598812533, 120.88381558656695],
            [30.04545857634996, 120.88390812277794],
            [30.045086507781406, 120.88399261236194],
            [30.045079542365865, 120.88400937616827],
            [30.04457803115946, 120.8841568976641],
            [30.044074776042457, 120.88430106639863],
            [30.043534949372514, 120.88445998728277],
            [30.042992797906784, 120.88461689651014],
            [30.042479666805804, 120.88476508855821],
            [30.041954343185648, 120.88492132723333],
            [30.041296668914693, 120.88509768247606]]
        },
        {
            type: 'WW',
            value: [[30.044919918125377, 120.87841495871547],
            [30.04416822960812, 120.87878845632078],
            [30.043757265443404, 120.87898559868336],
            [30.042962613797943, 120.87937653064729],
            [30.04240014285661, 120.87964810431005],
            [30.041915451712963, 120.87988682091239],
            [30.041277513287966, 120.88019594550136],
            [30.040839254755838, 120.88040918111804]]
        },
        {
            type: 'WW',
            value: [[30.04384027105474, 120.87628930807116],
            [30.04289237766293, 120.87674595415594],
            [30.041797035791692, 120.87727703154088],
            [30.04111614149766, 120.87760627269746],
            [30.0407312861311, 120.87779469788077],
            [30.04075508567676, 120.87784700095655],
            [30.040427115824425, 120.87804816663267]]
        },
        {
            type: 'WW',
            value: [[30.051930952732672, 120.85451982915401],
            [30.05160882401224, 120.85488192737105],
            [30.051289596318707, 120.85523732006553],
            [30.050953535507666, 120.85562020540239],
            [30.050583809256494, 120.85600510239603],
            [30.050258774049446, 120.85635513067248],
            [30.04995173088299, 120.85671387612821],
            [30.049644686764633, 120.85704915225507],
            [30.0493788519576, 120.8573153614998],
            [30.04918789157943, 120.85755608975889],
            [30.048850082349137, 120.85793092846872],
            [30.04860804306843, 120.85819713771345],
            [30.04837993356462, 120.85845530033113],
            [30.048200579921726, 120.85863232612611],
            [30.047956797750437, 120.85889719426633],
            [30.047847095577602, 120.85880331695081],
            [30.047744938947627, 120.85893005132677],
            [30.047703728004556, 120.85896357893947],
            [30.047795436840378, 120.85909701883794],
            [30.047718238901968, 120.85918217897417],
            [30.047521470952194, 120.85940614342691],
            [30.047198167011945, 120.8597655594349],
            [30.046960767216916, 120.86002171039581],
            [30.046679833717054, 120.86032681167127],
            [30.04646797218294, 120.8605420589447],
            [30.04612551011475, 120.86086593568326],
            [30.04587243569004, 120.86110867559911],
            [30.045543902330156, 120.86138829588893],
            [30.04517705813894, 120.86168602108957],
            [30.044799764436505, 120.86196765303615],
            [30.044415503834863, 120.86223252117637],
            [30.044023115337897, 120.86248062551023],
            [30.043623179308923, 120.86271598935129],
            [30.04319247716436, 120.86294800043108],
            [30.04280937125737, 120.86314514279367],
            [30.04239027491684, 120.86333289742471],
            [30.04207043704313, 120.86346030235292],
            [30.041695453393487, 120.8635997772217],
            [30.04110975627753, 120.86380161345006],
            [30.0407098084874, 120.86394377052784],
            [30.040281996074288, 120.86409598588945],
            [30.0398257381951, 120.86425423622133],
            [30.039399082933834, 120.86439907550813],
            [30.03897416729662, 120.86453452706338]]
        },
        {
            type: 'WW',
            value: [[30.042999183005545, 120.85219971835615],
            [30.042817497761675, 120.85233516991141],
            [30.042567317216044, 120.85252560675146],
            [30.042141254229403, 120.85286960005763],
            [30.04163566484757, 120.85328735411169],
            [30.0412455872352, 120.85359580814841],
            [30.04082938666063, 120.85393510758877],
            [30.04037487273885, 120.85430324077608],
            [30.04012700794638, 120.85449904203416],
            [30.039816450481094, 120.85475116968158],
            [30.03953839913953, 120.85498049855234],
            [30.039269054298455, 120.85519775748253],
            [30.038988679472745, 120.8554244041443],
            [30.038544025430806, 120.85578650236131],
            [30.038108076776265, 120.8561385422945],
            [30.037660516308677, 120.85649996995929],
            [30.037281777985534, 120.85679888929168]]
        },
        {
            type: 'WW',
            value: [[30.04059023016988, 120.84787130355836],
            [30.04034062447892, 120.84811940789224],
            [30.040147905236175, 120.84835343062879],
            [30.03982399674879, 120.84874838590625],
            [30.039462936219092, 120.84927007555964],
            [30.0393462588213, 120.84941625595094],
            [30.03910651826425, 120.84970928728582],
            [30.03895501122085, 120.84988564252855],
            [30.038784928325228, 120.85009552538396],
            [30.038676957461863, 120.85022896528245],
            [30.038503971639784, 120.85043214261533],
            [30.03824333135768, 120.85073053836824],
            [30.038114462189846, 120.85088342428209],
            [30.03798733433303, 120.85103899240495],
            [30.037848015946466, 120.85124418139458],
            [30.037691282527444, 120.85143059492114],
            [30.037537451338082, 120.85162505507472],
            [30.037357497568184, 120.85183963179591],
            [30.037128201162076, 120.85212461650373],
            [30.036948246648944, 120.85234053432941],
            [30.03678222380829, 120.85253834724426],
            [30.036597044157897, 120.85276834666732],
            [30.036456562812937, 120.8529292792082],
            [30.036323627803128, 120.85310295224191],
            [30.036163408951683, 120.85329942405227],
            [30.035755314112773, 120.85380233824255],
            [30.03544242091451, 120.85419930517675]]
        },
        {
            type: 'WW',
            value: [[30.041329175424284, 120.84127508103849],
            [30.041252552920326, 120.84133543074132],
            [30.040925745666065, 120.84160029888154],
            [30.0406018397216, 120.84186382591727],
            [30.040235557709323, 120.84216423332694],
            [30.039851279404157, 120.84249816834928],
            [30.03940082438762, 120.8428803831339],
            [30.039058918375193, 120.84316939115527],
            [30.038694372125192, 120.84348388016224],
            [30.038309507351695, 120.84381312131885],
            [30.038147550235415, 120.84397003054622],
            [30.037953665740893, 120.84413565695287],
            [30.037828279159193, 120.84424361586574],
            [30.037647745422603, 120.84439516067506],
            [30.037352853595614, 120.84465064108373],
            [30.03694244165921, 120.84500201046467],
            [30.03646410933653, 120.8454103767872],
            [30.03607691388437, 120.84574565291408],
            [30.035444628760917, 120.84631181304947],
            [30.035113272457895, 120.84669515490532],
            [30.034510121038004, 120.84749579429628],
            [30.03423205480641, 120.8479490876198],
            [30.033924381448816, 120.84856599569322],
            [30.03364457201881, 120.8491285890341],
            [30.03336708387855, 120.84969989955427],
            [30.033026898613024, 120.85040532052518],
            [30.032703547372076, 120.85107922554018],
            [30.032454502339856, 120.85159085690977],
            [30.032262928812298, 120.85200123488904],
            [30.032267603748128, 120.85199933205485],
            [30.031835660459322, 120.85286825895312]]
        },
        {
            type: 'WW',
            value: [[30.037690121538247, 120.85142858326438],
            [30.037461986893728, 120.85114963352683],
            [30.037296545410737, 120.85095986723903],
            [30.036779901808547, 120.85042007267478],
            [30.03650474445369, 120.8501585572958],
            [30.0360885239649, 120.8497790247202],
            [30.035737318426833, 120.84946118295193],
            [30.03547260731437, 120.84922514855863],
            [30.03520963702223, 120.84898576140404],
            [30.034987882282117, 120.8487839251757],
            [30.034770771139573, 120.84859415888789],
            [30.034421302472648, 120.84827698767187],
            [30.034299975022666, 120.84807582199576],
            [30.034232635321274, 120.84795042872432]]
        },
        {
            type: 'WW',
            value: [[30.04219175497885, 120.868022069335],
            [30.042169697183404, 120.86776994168758],
            [30.0420971386111, 120.86708329617977],
            [30.042045476875252, 120.8666065335274],
            [30.041988590887737, 120.86609825491905],
            [30.04193112439782, 120.86558930575849],
            [30.041871916464245, 120.86508102715015],
            [30.041767431789257, 120.86414426565172],
            [30.041741891074178, 120.86399205029014],
            [30.041695453393487, 120.86360178887846]]
        },
        {
            type: 'WW',
            value: [[30.047552814545604, 120.8534724265337],
            [30.04762569061441, 120.85237143143043],
            [30.046708528966548, 120.85111907691552],
            [30.045678895287796, 120.84967672428525],
            [30.042160223827853, 120.8467264575415],
            [30.042006177751794, 120.84657660272278],
            [30.04191699307195, 120.84646421160873],
            [30.039476544768437, 120.84284896410689]]
        },
        {
            type: 'WW',
            value: [[30.032118377632745, 120.90500369668008],
            [30.032096898122216, 120.9049601107836],
            [30.031998788947327, 120.9047730267048],
            [30.031839724161575, 120.90447396039966],
            [30.03170271925097, 120.90421445667747],
            [30.03147689294683, 120.90380206704141],
            [30.031367172525933, 120.90355932712556],
            [30.031245841337043, 120.90335950255394],
            [30.031086194809617, 120.90305842459203],
            [30.030970668616646, 120.90283378958705],
            [30.030856303358345, 120.9026111662388],
            [30.030683884419965, 120.90227589011195],
            [30.030494629617067, 120.90190775692463],
            [30.030298988536035, 120.90153627097608],
            [30.030102185990756, 120.90114802122118],
            [30.03002903804244, 120.90100385248662],
            [30.029846748476082, 120.90060956776145],
            [30.029705096479653, 120.90030781924726],
            [30.02968651915364, 120.9001435339451],
            [30.02962091794326, 120.89996315538885],
            [30.029295813959134, 120.89945018291475],
            [30.029061273994166, 120.89902035892011],
            [30.02879654505019, 120.89851677417757],
            [30.028504529627444, 120.89802525937559],
            [30.028349523079367, 120.89772887527945],
            [30.028109755918965, 120.89726954698564],
            [30.02788740474101, 120.89685246348384],
            [30.027958812614933, 120.89681290090085],
            [30.028011642797466, 120.89677467942239],
            [30.02808537278541, 120.89689604938032]]
        },
        {
            type: 'WW',
            value: [[30.03104787960477, 120.89956149458885],
            [30.03092654802503, 120.89938916265966],
            [30.03050449874148, 120.89972712099554],
            [30.030066773101876, 120.90004228055479],
            [30.02987055063593, 120.90018779039386],
            [30.02970567702103, 120.90030781924726]]
        },
        {
            type: 'WW',
            value: [[30.029979692173818, 120.89027099311355],
            [30.029639495281586, 120.89068405330183],
            [30.02925749806217, 120.89115209877491],
            [30.028901623948084, 120.89158996939659],
            [30.02881221980999, 120.8918709307909],
            [30.028702496439344, 120.8919842541218],
            [30.028522526626674, 120.89204393327238],
            [30.028155619415795, 120.89241005480291],
            [30.027838638358535, 120.89263871312143],
            [30.02734052322064, 120.89292638003829],
            [30.02677738304567, 120.89324690401556],
            [30.02627635976783, 120.89352920651437],
            [30.025879254930725, 120.89375585317615],
            [30.026167214152395, 120.89414209127428],
            [30.02643136955768, 120.89450083673002],
            [30.02671468270456, 120.89489579200746],
            [30.027031086798818, 120.89536450803281],
            [30.02732891211531, 120.89584998786452],
            [30.02763370317944, 120.89638106524947],
            [30.02788740474101, 120.89685246348384]]
        },
        {
            type: 'WW',
            value: [[30.030644407987833, 120.89452296495439],
            [30.03048882424928, 120.89483745396137],
            [30.030450508813523, 120.89490450918676],
            [30.030352978546535, 120.89507013559343],
            [30.030055742855215, 120.8954952657223],
            [30.029730059756023, 120.89590162038805],
            [30.02937941222831, 120.89626774191859],
            [30.028910912685106, 120.89666940271856],
            [30.028435444341945, 120.8970046788454],
            [30.028189871886934, 120.89721053838733],
            [30.028109755918965, 120.8972702175379]]
        },
        {
            type: 'WW',
            value: [[30.031069359342624, 120.89374780654909],
            [30.031211589921924, 120.89348427951337],
            [30.03138168581609, 120.89317046105863],
            [30.03152507700865, 120.89290358126165],
            [30.031515788516604, 120.89277617633344],
            [30.03176309431967, 120.8923188596964],
            [30.03188848857559, 120.89221425354481],
            [30.031999369475272, 120.892024487257],
            [30.032219389322574, 120.89160472154619],
            [30.032386000333126, 120.89131973683835],
            [30.032644914448795, 120.89082889258863],
            [30.033021673915545, 120.89014492928983],
            [30.033374050117523, 120.88944956660274],
            [30.033621351283724, 120.88865965604784],
            [30.033726425066593, 120.88786236941816],
            [30.033924381448816, 120.88759884238246],
            [30.03410318042193, 120.88764242827894],
            [30.034140913930223, 120.88714420795442]]
        },
        {
            type: 'WW',
            value: [[30.032644333924615, 120.89748211205006],
            [30.032975232148047, 120.89697182178499],
            [30.03318247836741, 120.89661039412023],
            [30.03345183975274, 120.89610345661643],
            [30.033738035422513, 120.89558109641078],
            [30.033923800932143, 120.89523240923882],
            [30.034196643393123, 120.89472748339178],
            [30.034412594765868, 120.89432649314405],
            [30.034419560931333, 120.89425608515742],
            [30.034613452340686, 120.89389197528364],
            [30.034728393775527, 120.89366868138315],
            [30.03522763280397, 120.89331194758418],
            [30.035286264199264, 120.89321807026865],
            [30.036188370601366, 120.89384973049165],
            [30.036748554806703, 120.89424602687362],
            [30.03712297668082, 120.89451290667058],
            [30.037220500285542, 120.89481733739377],
            [30.037343565649785, 120.89488036930561],
            [30.03760130582305, 120.89485354721549],
            [30.03803609572206, 120.89516200125219],
            [30.03838032722617, 120.89540608227256],
            [30.038647352527143, 120.89557841420175],
            [30.038768094166127, 120.89535444974901]]
        },
        {
            type: 'WW',
            value: [[30.039769431415518, 120.88554829359056],
            [30.039335810092396, 120.88567569851877],
            [30.038776801490172, 120.88583864271642],
            [30.038307185387726, 120.88597275316717],
            [30.038120847603, 120.88613770902158],
            [30.037983270882858, 120.88616721332075],
            [30.03780970335583, 120.88611759245397],
            [30.03741264472595, 120.8862342685461],
            [30.03727506702251, 120.88663123548031],
            [30.037082341817193, 120.88662184774877],
            [30.037066087867064, 120.88709190487863],
            [30.037024291983066, 120.88763706386092],
            [30.036992364559836, 120.88793814182281],
            [30.036941280661235, 120.88826671242715],
            [30.036871620757058, 120.8886569738388],
            [30.036763647808826, 120.88914513587953],
            [30.036613298184946, 120.88975667953493],
            [30.036477460876878, 120.89015431702137],
            [30.036440308760167, 120.89026495814323],
            [30.0362423574036, 120.89080072939397],
            [30.036043825147374, 120.89125737547877],
            [30.03579362749771, 120.89176028966905],
            [30.035722225268376, 120.8918944001198],
            [30.035210496763284, 120.89284557255633],
            [30.035861546643723, 120.89331060647966],
            [30.036286475628756, 120.89359760284425],
            [30.03679963880464, 120.89397311210634],
            [30.03726635956651, 120.89430704712869],
            [30.037442250029564, 120.89420579373838],
            [30.03761291572496, 120.8943023532629],
            [30.037680253129356, 120.89459605515006],
            [30.03817657482768, 120.89494943618776],
            [30.038476108123408, 120.89516267180446],
            [30.038768674654403, 120.89535377919674]]
        },
        {
            type: 'WW',
            value: [[30.03378157424508, 120.88451832532884],
            [30.03377054441184, 120.88427357375623],
            [30.03368056414744, 120.88343001902105],
            [30.03358245654026, 120.88258646428586],
            [30.03348434883596, 120.88174425065519],
            [30.033366503358597, 120.88069349527362],
            [30.033268395440537, 120.87985061109067],
            [30.033177253678122, 120.87908282876016],
            [30.033077984529474, 120.87824262678625],
            [30.032983939981108, 120.87740242481233],
            [30.032889314820782, 120.87656557559968],
            [30.032792948000235, 120.87572671473028],
            [30.03269658108598, 120.87488517165187],
            [30.032608921944025, 120.87413348257543],
            [30.03259789198028, 120.8740235120058],
            [30.03257525152454, 120.87380222976209],
            [30.032505588551334, 120.87323427200319],
            [30.032412704510886, 120.87238803505899],
            [30.03230995143971, 120.87154246866704],
            [30.03220023194102, 120.87059162557127],
            [30.03210328392314, 120.86974538862707],
            [30.032013882672864, 120.86896553635599],
            [30.0319175150011, 120.86812332272531],
            [30.031826371996413, 120.86733072996141],
            [30.031704460840018, 120.8662806451321],
            [30.031576744229604, 120.86517490446569],
            [30.03180547295169, 120.8647980540991],
            [30.03177586596411, 120.86454659700397],
            [30.03145251064157, 120.86412012577058],
            [30.03141767876652, 120.86389884352687],
            [30.03206554963902, 120.86356222629549],
            [30.032361618251525, 120.86341202259065],
            [30.037134006140917, 120.85996001958848],
            [30.037113108215443, 120.85991710424426]]
        },
        {
            type: 'WW',
            value: [[30.03838032722617, 120.87884277105333],
            [30.03829963900451, 120.8786751329899],
            [30.038074408225167, 120.87874956429008],
            [30.03778880557287, 120.87884142994882],
            [30.037720887747803, 120.87886154651642],
            [30.037372009981095, 120.87897285819054],
            [30.03702603347858, 120.87908618152143],
            [30.037007457524812, 120.87906606495383],
            [30.036339881875033, 120.879277959466],
            [30.035843550977095, 120.87943822145463],
            [30.035558522402066, 120.87952941656114],
            [30.035310065052794, 120.87960921227933],
            [30.034242504073486, 120.87995387613775],
            [30.033708429012243, 120.8801255375147],
            [30.033477382604747, 120.879819765687],
            [30.033267814920023, 120.87985061109067]]
        }, {
            type: 'WW',
            value: [[30.035723386280655, 120.87433196604253],
            [30.03573557690867, 120.87434470653534],
            [30.035782017382623, 120.87438225746156],
            [30.03579362749771, 120.87443791329862],
            [30.035805237611445, 120.8745452016592],
            [30.035859224622428, 120.87498508393766],
            [30.035923080188805, 120.87561607360841],
            [30.03600318984119, 120.87632417678834],
            [30.036061820777615, 120.87684988975526],
            [30.03617501902209, 120.87782621383668],
            [30.036276026577195, 120.87871670722963],
            [30.036339301372507, 120.87927863001826]]
        }, {
            type: 'WW',
            value: [[30.036736364303287, 120.88103748857976],
            [30.036729978800903, 120.88096708059312],
            [30.036539574540836, 120.88098384439947],
            [30.03646468983832, 120.88035821914674],
            [30.03639444909692, 120.87973929941656],
            [30.036339881875033, 120.87927863001826]]
        },
        {
            type: 'WW',
            value: [[30.03853705955528, 120.87161153554918],
            [30.03790954825803, 120.87186701595783],
            [30.037487528712077, 120.87203666567805],
            [30.036963339620662, 120.87225124239924],
            [30.03650358345057, 120.87243832647802],
            [30.03608271892479, 120.87260730564594],
            [30.0355933528218, 120.87280578911304],
            [30.035149844562625, 120.87298683822156],
            [30.034627384642913, 120.87320007383825],
            [30.034140333414822, 120.87339855730535],
            [30.033616126617563, 120.87361045181754],
            [30.033100624870354, 120.8738210052252],
            [30.032597311455845, 120.87402418255807]]
        },
        {
            type: 'WW',
            value: [[30.038432571363415, 120.87126553058626],
            [30.03846565930275, 120.87134532630445],
            [30.03849120086241, 120.87138555943967],
            [30.037442250029564, 120.87180800735953],
            [30.03683272728925, 120.87205812335017],
            [30.036825761293425, 120.87202526628973],
            [30.03675319880759, 120.87205812335017],
            [30.036468753350754, 120.87220765650274],
            [30.03608271892479, 120.87236255407335],
            [30.03569610248871, 120.87252147495747],
            [30.03554923428805, 120.87259255349637],
            [30.035182933598136, 120.87272867560387],
            [30.035172484430216, 120.87273471057416],
            [30.03471155892724, 120.87293252348903],
            [30.033596969506025, 120.87338984012605],
            [30.033349087758936, 120.87349176406862],
            [30.03309540017677, 120.8735775947571],
            [30.03257525152454, 120.87380290031433]]
        }, {
            type: 'WW',
            value: [[30.037636135524764, 120.8696521818638],
            [30.037114269211436, 120.86985938251021],
            [30.03649023191376, 120.87010681629182],
            [30.03635381393452, 120.87030261754992],
            [30.03624409891288, 120.87034419178964],
            [30.036096651020458, 120.87026439607145],
            [30.035609607013473, 120.87045751512052],
            [30.035556780880754, 120.87070025503637],
            [30.035364632841762, 120.87071031332019]]
        }, {
            type: 'WW',
            value: [[30.03588534735909, 120.872255936265],
            [30.03585341956888, 120.87234646081926],
            [30.035555039359412, 120.8723994344473],
            [30.035498730152966, 120.87189182639125],
            [30.03543081075828, 120.8713010698557],
            [30.035365213350012, 120.87071031332019],
            [30.03528742521663, 120.87003841996194],
            [30.035216022622578, 120.86940608918668],
            [30.035156810676288, 120.86881466209888],
            [30.03507844186944, 120.86814276874068],
            [30.035008780655744, 120.86751043796541],
            [30.034936216839444, 120.86688011884692],
            [30.03487352165936, 120.86633160710336],
            [30.034479353831557, 120.86646772921087],
            [30.033944699530192, 120.86664810776712],
            [30.033411783903414, 120.86683452129365],
            [30.0328806069794, 120.8670222759247],
            [30.032064969111456, 120.86728982627393],
            [30.031826371996413, 120.86733072996141]]
        },
        {
            type: 'WW',
            value: [[30.036444952775508, 120.86578376591208],
            [30.03593527079227, 120.86595676839353],
            [30.035406429425763, 120.86614519357683],
            [30.03487352165936, 120.86633160710336]]
        },
        {
            type: 'WW',
            value: [[30.0349449245002, 120.86526677012446],
            [30.034915898961348, 120.86529091000558],
            [30.03476322448703, 120.86531169712543],
            [30.034826500248265, 120.86582064628602],
            [30.034807343370687, 120.86586758494377],
            [30.03487352165936, 120.8663322776556]]
        },
        {
            type: 'WW',
            value: [[30.033944699530192, 120.86664810776712],
            [30.033885486824282, 120.86639598011972],
            [30.033562718903397, 120.86579315364362],
            [30.03347099689237, 120.86519032716753],
            [30.03329858250259, 120.86397863924505],
            [30.03318538097245, 120.86334429681303],
            [30.03322079274707, 120.86284674704076],
            [30.033228339517066, 120.86278438568117]]
        },
        {
            type: 'WW',
            value: [[30.029158805532155, 120.85943832993509],
            [30.02969174402694, 120.85999488830568],
            [30.030045293146728, 120.86044751107694],
            [30.03043715646122, 120.86102552711966],
            [30.03075412920883, 120.861629024148],
            [30.031053684939785, 120.86238875985148],
            [30.031193593410922, 120.86282260715961],
            [30.031658598985217, 120.86267776787281],
            [30.031867009015237, 120.86309485137464],
            [30.03206554963902, 120.86356222629549]]
        }, {
            type: 'WW',
            value: [[30.028541104170845, 120.8593109250069],
            [30.02883486112532, 120.85876710712913],
            [30.029118747947802, 120.858251452446],
            [30.029407278302386, 120.8577036112547],
            [30.029682455363098, 120.85717990994455],
            [30.030008138618722, 120.85658043622972],
            [30.030237451498984, 120.85614793002607],
            [30.03050449874148, 120.85562422871591],
            [30.030984020897098, 120.85463516414167],
            [30.031286478593902, 120.85399411618711],
            [30.031545976112504, 120.85346505045894],
            [30.031666726404072, 120.85320621728899],
            [30.031730584671863, 120.85308551788331],
            [30.03180198977713, 120.85293665528299],
            [30.031835660459322, 120.85286825895312]]
        },
        {
            type: 'WW',
            value: [[30.034730715823336, 120.87080687284471],
            [30.034604164138123, 120.87085984647274],
            [30.034204770603843, 120.8710201084614],
            [30.034113629702595, 120.8710489422083],
            [30.033670695339275, 120.87118707597257],
            [30.033490734547474, 120.87123870849611],
            [30.033132553547485, 120.87133660912515],
            [30.032989164680576, 120.87137348949912],
            [30.032546805816384, 120.87149284780027],
            [30.03230995143971, 120.87154246866704]]
        },
        {
            type: 'WW',
            value: [[30.028723396138368, 120.87272197008134],
            [30.02925691751817, 120.87255701422694],
            [30.030250223339987, 120.87223716080192],
            [30.03079244452724, 120.87205946445467],
            [30.031491406220933, 120.87184287607671],
            [30.032209061819394, 120.87154954146129],
            [30.032309126799923, 120.87154113544842]]
        },
        {
            type: 'WW',
            value: [[30.03079186399222, 120.87205879390241],
            [30.030923645353834, 120.87282456457616],
            [30.031090258542584, 120.87380960583688],
            [30.031082131076477, 120.87381698191167],
            [30.031109416138683, 120.8743862807751]]
        },
        {
            type: 'WW',
            value: [[30.029020055279627, 120.87523788213733],
            [30.029542544758904, 120.87502330541612],
            [30.030064450944806, 120.87480872869494],
            [30.030624089229864, 120.87458007037641],
            [30.031109416138683, 120.87438695132735],
            [30.03112718175172, 120.87437801121848],
            [30.03140958572651, 120.87426417140571],
            [30.03207294760295, 120.87399270723685],
            [30.03239704564806, 120.8738701105154],
            [30.03257709965963, 120.873800055246]]
        },
        {
            type: 'WW',
            value: [[30.0290630156296, 120.87546922266485],
            [30.029517581435332, 120.87527677416801],
            [30.029982014332898, 120.87509304285052],
            [30.030559069176416, 120.87485767900945],
            [30.03091493733976, 120.87471149861813],
            [30.031131476396236, 120.87462231516838],
            [30.031619703471478, 120.87442047894004],
            [30.032145662409693, 120.87420724332334],
            [30.032414446087444, 120.8740992844105],
            [30.032598472504738, 120.87402418255807]]
        },
        {
            type: 'WW',
            value: [[30.034010297878762, 120.89199967682362],
            [30.03520963702223, 120.89284658432008]]
        },
        {
            type: 'WW',
            value: [[30.03385065580429, 120.89221358299257],
            [30.03481430950842, 120.89288011193277],
            [30.03528568369058, 120.89321874082088]]
        },
        {
            type: 'WW',
            value: [
                [30.033522663098907, 120.88450357317927],
                [30.033525565693974, 120.88448010385038],
                [30.033557494234188, 120.88430844247341],
                [30.03377054441184, 120.88427357375623]
            ]
        },
        {
            type: 'PP',
            value: [[30.025660382140213, 120.90428687632085],
            [30.025638320665042, 120.90429492294791],
            [30.025755594766295, 120.90473681688312],
            [30.02580842612301, 120.90511836111547],
            [30.02584500166119, 120.90567223727705],
            [30.02593615016582, 120.90591967105867],
            [30.025929183404088, 120.90620197355749],
            [30.02593034453107, 120.90625159442426],
            [30.025928022277082, 120.90653724968433],
            [30.02609928836299, 120.90652182698251],
            [30.026289712680626, 120.90651176869869],
            [30.026522517523194, 120.90650103986263],
            [30.026556770558642, 120.90650238096715],
            [30.026743710645185, 120.90649567544462],
            [30.02704908406557, 120.9064842760563],
            [30.027380000968552, 120.90641587972642],
            [30.02754313678967, 120.90634748339653],
            [30.027856635478678, 120.9062220901251],
            [30.028047056420576, 120.90610742568971],
            [30.02838609767997, 120.90581707656385],
            [30.028419769522557, 120.90580634772779],
            [30.02861773650376, 120.90571112930778],
            [30.02864502224437, 120.90570174157621],
            [30.029033407822816, 120.90550526976585],
            [30.02927665601251, 120.90542614459993],
            [30.029704515938274, 120.90519279241565],
            [30.030050518001122, 120.90499699115755],
            [30.03034949532093, 120.9048092365265],
            [30.030374458435016, 120.90457588434221],
            [30.030623508693882, 120.90438276529315],
            [30.03063221673355, 120.90436801314357],
            [30.03067749852759, 120.90425334870815],
            [30.031232489091884, 120.90391941368583],
            [30.031566875211958, 120.90371556580067],
            [30.03204290906166, 120.90341448783876],
            [30.03205393908718, 120.90334676206112],
            [30.032441730782867, 120.90303964912891],
            [30.032644333924615, 120.90286530554296],
            [30.032956074912594, 120.90265139937401],
            [30.03312036259925, 120.90251997113229],
            [30.03331077342889, 120.90236708521846],
            [30.03336011763909, 120.90242944657804],
            [30.033551689045808, 120.9026735275984],
            [30.033674758966285, 120.90272650122643],
            [30.033906965947192, 120.90257026255132],
            [30.03452405335476, 120.90197548270226],
            [30.035148683543632, 120.9012593328953],
            [30.03551556486752, 120.90083554387094],
            [30.03571583970065, 120.90051367878915],
            [30.036015960939213, 120.90000137686732],
            [30.036251645452634, 120.89957892894746],
            [30.036465270340106, 120.89915111660959],
            [30.036561053088473, 120.89897543191911],
            [30.036629552209323, 120.89880846440792],
            [30.03664174272589, 120.89876487851144],
            [30.03671372479299, 120.89863412082197],
            [30.036724173798394, 120.8986133337021],
            [30.036741008304762, 120.89858248829843],
            [30.036815892798458, 120.89844971895221],
            [30.036934314673015, 120.89821234345438],
            [30.03718625093529, 120.89776508510116],
            [30.037393488348307, 120.89741908013822],
            [30.037691282527444, 120.89697584509852],
            [30.03802216389905, 120.89642666280271],
            [30.03820443842828, 120.89612826704982],
            [30.038342014841355, 120.89585602283479],
            [30.03853647906563, 120.89550800621512],
            [30.038653737905967, 120.89529745280745],
            [30.038865035663996, 120.89491590857509],
            [30.038989840446753, 120.89467182755472],
            [30.039299239532575, 120.89407369494441],
            [30.039576130578197, 120.89357748627664],
            [30.039872176752144, 120.89302964508533],
            [30.039872757233958, 120.8930289745331],
            [30.03999639978519, 120.892785564065],
            [30.040237299148405, 120.89230678975584],
            [30.04030173237277, 120.89214585721493],
            [30.040339463520763, 120.89205063879491],
            [30.04055366007307, 120.89141562581064],
            [30.040721418025125, 120.89090399444105],
            [30.0408456399934, 120.89038096368314],
            [30.040965218002686, 120.88992096483709],
            [30.041088859190605, 120.88946901261808],
            [30.0412235292291, 120.88905259966853],
            [30.041250811499083, 120.88884070515634],
            [30.041163740398407, 120.88852152228358],
            [30.041200890744058, 120.88806152343751],
            [30.041280996129483, 120.8878342062235],
            [30.041296088441225, 120.88729575276376],
            [30.041288542285635, 120.88675796985628],
            [30.04128970323267, 120.88623158633712],
            [30.041258357657547, 120.88582925498487],
            [30.041216563541965, 120.88533774018289],
            [30.041234558232773, 120.88493876159193],
            [30.041167803718125, 120.88451430201533],
            [30.04109176156405, 120.88402882218364],
            [30.04100991460016, 120.88333882391454],
            [30.040995402720082, 120.88321812450889],
            [30.040928648044297, 120.88263005018236],
            [30.04086247379956, 120.88191255927089],
            [30.040861312847486, 120.88190183043483],
            [30.040799782369042, 120.881439819932],
            [30.040772499974864, 120.88124334812166],
            [30.040769017115483, 120.88122054934502],
            [30.04072780327027, 120.88076457381248],
            [30.040677882251718, 120.88039241731168],
            [30.040633765981813, 120.879864692688],
            [30.040571654884307, 120.87934702634814],
            [30.040485163664982, 120.87863489985469],
            [30.04038125800636, 120.87803274393083],
            [30.04033540016705, 120.87769277393821],
            [30.04027444984145, 120.87723344564439],
            [30.040205953240314, 120.87672181427482],
            [30.04012874938737, 120.87601438164714],
            [30.04012874938737, 120.87601438164714],
            [30.04006779893465, 120.87551213800909],
            [30.040027745759588, 120.87507091462614],
            [30.03994183454685, 120.87435476481917],
            [30.039865791451838, 120.87368689477445],
            [30.039786265404523, 120.87305121123792],
            [30.0398100651772, 120.8728138357401],
            [30.039758982731247, 120.8721761405468],
            [30.039713705086683, 120.87162695825101],
            [30.039713124603928, 120.87161354720594],
            [30.039705578327784, 120.87155789136888],
            [30.039703836879365, 120.87154112756254],
            [30.039696290602507, 120.87150424718858],
            [30.03967713466635, 120.87139561772348],
            [30.039638242299777, 120.87115488946439],
            [30.039551169781898, 120.87078876793387],
            [30.039456550892403, 120.87016448378566],
            [30.03938457081781, 120.86955696344377],
            [30.039387473241177, 120.86932763457301],
            [30.03944668265946, 120.86890116333963],
            [30.039321297967085, 120.86822859942914],
            [30.039230161771684, 120.86769618093969],
            [30.03918430339962, 120.8671771734953],
            [30.039133801117192, 120.86664140224458],
            [30.039058918375193, 120.86595676839353],
            [30.038991001420737, 120.86519904434684],
            [30.038959655118358, 120.86484231054784],
            [30.038914957595953, 120.86458280682565],
            [30.038816855170918, 120.86406782269479],
            [30.03874545512001, 120.8635387569666],
            [30.038638645191725, 120.86295738816263],
            [30.03855157179545, 120.8623317629099],
            [30.038514420456394, 120.86195692420009],
            [30.038445922638505, 120.86134739220145],
            [30.038372780848505, 120.86071439087394],
            [30.0383176342251, 120.86025036871435],
            [30.03821778973413, 120.85976153612138],
            [30.03812316957132, 120.85930287837984],
            [30.03775803938438, 120.85815154016018],
            [30.03763671601968, 120.85775323212147],
            [30.03743818655705, 120.85729256272317],
            [30.037333697206417, 120.85693381726742],
            [30.037229207745586, 120.85674472153187],
            [30.03701442350789, 120.85646979510786],
            [30.03668063626863, 120.85593067109586],
            [30.036399093114426, 120.85551962256434],
            [30.036098392532285, 120.85514947772029],
            [30.035869093212632, 120.85483901202682],
            [30.035570132543334, 120.85446886718275],
            [30.03539075570883, 120.8542609959841],
            [30.0351620352612, 120.85404373705389],
            [30.03483462740733, 120.85377082228663],
            [30.034618676954253, 120.85355423390867],
            [30.034083442888782, 120.8531726896763],
            [30.033549366970366, 120.85285484790803],
            [30.033043153225652, 120.85259601473808],
            [30.032586281490804, 120.8524136245251],
            [30.03216249769382, 120.85217691957952],
            [30.03212011921447, 120.85215076804161],
            [30.032137535030103, 120.85211321711543],
            [30.031903001789413, 120.85196033120157],
            [30.03193725296561, 120.85188657045366],
            [30.032099220231675, 120.85155598819257],
            [30.032400513474105, 120.85096053779127],
            [30.0328881537753, 120.84994733333589],
            [30.033094239133703, 120.84950409829618],
            [30.033404237147387, 120.84888853132726],
            [30.033689852436588, 120.84829308092596],
            [30.03393889436451, 120.84781832993033],
            [30.034019005620884, 120.84766477346423],
            [30.03437253930485, 120.84710016846658],
            [30.03443407377451, 120.8470103144646],
            [30.03472084711975, 120.84662809967996],
            [30.0352607218135, 120.84601387381556],
            [30.035281620129624, 120.84599375724794],
            [30.035429069234727, 120.84588646888733],
            [30.03543835735999, 120.84587641060352],
            [30.035485958988303, 120.84582947194578],
            [30.03542152263231, 120.84573827683927],
            [30.035470865791552, 120.84569670259954],
            [30.03552427247738, 120.84564574062824],
            [30.035685072868542, 120.84550291299821],
            [30.036206946708692, 120.845058336854],
            [30.03658079012818, 120.84472976624967],
            [30.036958695629618, 120.84438376128675],
            [30.03764019898916, 120.84380172193052],
            [30.038109237760576, 120.84340743720533],
            [30.038329824533964, 120.84322504699232],
            [30.038772738072364, 120.84287837147714],
            [30.03917733756908, 120.84252297878267],
            [30.039577872028854, 120.84217227995397],
            [30.040028326240485, 120.84175050258638],
            [30.04032088818817, 120.84150508046152],
            [30.04094896468951, 120.84101356565954],
            [30.0413849008445, 120.84064342081548],
            [30.04153582370018, 120.84047980606559],
            [30.04164843521964, 120.84038257598878],
            [30.041686746325947, 120.84038726985456],
            [30.041698355749173, 120.84040269255641],
            [30.041725057417423, 120.84043689072135],
            [30.042039672184135, 120.84043756127359],
            [30.042040247365364, 120.84043587816997],
            [30.042484891004623, 120.8410578221083],
            [30.042704887571055, 120.84082782268524],
            [30.042913854833465, 120.84061324596406],
            [30.043028206176583, 120.840557590127]]
        },
        {
            type: 'PP',
            value: [[30.027288853791486, 120.87724015116694],
            [30.02730104545695, 120.8771798014641],
            [30.027500756335268, 120.87707452476026],
            [30.027721366721504, 120.87693102657798],
            [30.027658666977448, 120.87648913264277],
            [30.027604094945747, 120.87603919208051],
            [30.027597128301213, 120.87587893009187],
            [30.02760525605311, 120.87577030062678],
            [30.02806098964585, 120.87552085518838],
            [30.028222963246133, 120.8753525465727],
            [30.02850743236945, 120.87529353797439],
            [30.028823830741562, 120.87548129260541],
            [30.02933587147191, 120.87528079748157],
            [30.029844426313822, 120.8750742673874],
            [30.030358203384697, 120.87486907839778],
            [30.03089926291247, 120.87464511394502],
            [30.030992148371265, 120.8744439482689],
            [30.031082131076477, 120.87427899241447],
            [30.031493147813674, 120.87381295859815],
            [30.031939575078813, 120.87331205606463],
            [30.03230472670442, 120.87289564311506],
            [30.03230298512593, 120.87288357317449],
            [30.032291374601904, 120.87276421487333],
            [30.032248996177664, 120.87240882217884],
            [30.032227516695425, 120.87222509086133],
            [30.03215669242377, 120.87161287665367],
            [30.032073096497005, 120.87090745568277],
            [30.03204000642316, 120.87061509490013],
            [30.0319906615557, 120.87019063532354],
            [30.031942477720264, 120.86977086961271],
            [30.031908226545873, 120.86946710944179],
            [30.031897196504143, 120.86941681802274],
            [30.03184436839251, 120.86890719830991],
            [30.03177354384704, 120.86828559637073],
            [30.031757869555573, 120.86814679205419],
            [30.031712588255104, 120.86775049567223],
            [30.03166614587417, 120.86735419929029],
            [30.03164176361547, 120.86713895201683],
            [30.031564553090003, 120.86647644639017],
            [30.03154423452068, 120.86630210280421],
            [30.03148618144249, 120.86580388247968],
            [30.03142116195457, 120.86523123085502],
            [30.03140432654449, 120.86508303880693],
            [30.031238874948507, 120.8646532148123],
            [30.031236552818868, 120.86460895836356],
            [30.031230166962118, 120.86450569331647],
            [30.031230747494565, 120.86438834667207],
            [30.03131434413181, 120.86426831781866],
            [30.03125164666048, 120.8636996895075],
            [30.031240616545674, 120.86360245943071],
            [30.031237713883687, 120.86357831954957],
            [30.031668467993732, 120.86268447339536],
            [30.03133926463644, 120.8618401167327],
            [30.030618522300962, 120.86020594700109],
            [30.029590788054044, 120.85888011118107],
            [30.028767998896427, 120.85826218979022],
            [30.02907537089542, 120.85767155541922],
            [30.029385536219127, 120.85710674113004],
            [30.02968452349532, 120.85653224431016],
            [30.029955567256064, 120.85604166275608],
            [30.03023778729149, 120.85547362095669],
            [30.0304669158381, 120.85499917695375],
            [30.030656924475, 120.85459251066551],
            [30.030961496383085, 120.85396960119232],
            [30.03123253665189, 120.8534047869031],
            [30.031481222432085, 120.85291420534908],
            [30.03162931591487, 120.85258499930622],
            [30.031928296422766, 120.85197177236368]]
        },
        {
            type: 'PP',
            value: [[30.03409621423423, 120.88709928095342],
            [30.034048031422422, 120.88709928095342],
            [30.03394121643082, 120.88659033179283],
            [30.033919737315337, 120.88657289743426],
            [30.033638766835548, 120.88641799986364],
            [30.033537176073427, 120.88634960353376],
            [30.03353195140284, 120.88613703846933],
            [30.033522663098907, 120.885808467865],
            [30.03352324361792, 120.88580243289472],
            [30.033537756592363, 120.88543429970744],
            [30.03354007866806, 120.88509969413282],
            [30.033540659186972, 120.8850433677435],
            [30.03354356178153, 120.88469333946708],
            [30.03354182022482, 120.8846752345562],
            [30.033522663098907, 120.88450491428377]]
        },
        {
            type: 'PP',
            value: [[30.0354656412229, 120.8874747902155],
            [30.03378157424508, 120.8845189958811]]
        }, {
            type: 'PP',
            value: [[30.02816606932351, 120.89692890644075],
            [30.028247346345847, 120.8969470113516],
            [30.028268246140822, 120.89694432914258],
            [30.028619478147007, 120.89671969413759],
            [30.028937037253236, 120.89649304747584],
            [30.02920176582201, 120.89628383517265],
            [30.029428758395774, 120.89607529342176],
            [30.029595374097394, 120.89588552713396],
            [30.0297915971081, 120.89561931788923],
            [30.030091155748043, 120.89526526629926],
            [30.03030653552852, 120.89494809508327],
            [30.03035181747136, 120.89487299323085],
            [30.03078431703671, 120.89469127357007],
            [30.03106877880923, 120.89374780654909]]
        },
        {
            type: 'PP',
            value: [[30.01944407704075, 120.88741376996042],
            [30.019477751920437, 120.8873473852873],
            [30.019487622141632, 120.88732257485391],
            [30.01948936394528, 120.88731385767461],
            [30.019487622141632, 120.88727764785291],
            [30.019512587990842, 120.88720925152302],
            [30.019848755441327, 120.88737152516843],
            [30.01990913772966, 120.88737756013872],
            [30.020038030568273, 120.88737353682518],
            [30.020045578341925, 120.88734537363054],
            [30.020165762044854, 120.88732659816743],
            [30.0202807202331, 120.8871951699257],
            [30.02041774092984, 120.88702820241453],
            [30.020871185190593, 120.88681496679784],
            [30.021004721517446, 120.88692896068099],
            [30.021151030677785, 120.88715896010402],
            [30.021416941218078, 120.8875820785761],
            [30.02141636062815, 120.88760353624822],
            [30.021638726319793, 120.88795624673368],
            [30.02221582973071, 120.88887020945549],
            [30.022924721778057, 120.88998466730119],
            [30.023087284350503, 120.88996790349485],
            [30.023203980889967, 120.889949798584],
            [30.023524460232018, 120.89047014713289],
            [30.02366089586944, 120.89068472385408]]
        },
        {
            type: 'WW',
            value: [[30.023695149893584, 120.89073769748212],
            [30.023834488174977, 120.8909569680691],
            [30.024164254660747, 120.89138746261598],
            [30.02428094993257, 120.89154437184337],
            [30.024484730898777, 120.89182667434217],
            [30.024875455055653, 120.89235037565234],
            [30.025262653687427, 120.89294785131291],
            [30.025544550522774, 120.89330316888288],
            [30.02587925869729, 120.89375451633094]]
        },
        {
            type: 'PP',
            value: [[29.995757353873636, 120.87986938655378],
            [29.995969323787904, 120.87982043623927],
            [29.99598326151982, 120.8798184245825],
            [29.995984422997402, 120.87966151535511],
            [29.995982680781044, 120.87955422699454],
            [29.99598674595251, 120.87937049567701],
            [29.996029720612132, 120.87927125394344],
            [29.996264919433095, 120.87903186678889],
            [29.99656690228731, 120.87886892259122],
            [29.996894436498152, 120.8792618662119],
            [29.99722371182272, 120.87964542210105],
            [29.997564600646328, 120.87997868657114],
            [29.997954850127883, 120.88026233017447],
            [29.998317803997637, 120.88055938482286],
            [29.998679595094004, 120.88092148303987],
            [29.998695855337026, 120.88109984993936],
            [29.99894963092753, 120.8814572542906],
            [29.99920689018874, 120.88164836168292],
            [29.999503637627917, 120.88184818625453],
            [29.999776574802254, 120.88199503719807],
            [30.000186559870535, 120.88233299553397],
            [30.000585509720313, 120.88256500661375],
            [30.001050658830067, 120.88266156613828],
            [30.001440894603558, 120.88272660970689],
            [30.001736473952274, 120.88282115757468],
            [30.001904297591413, 120.88277824223044],
            [30.002389765067136, 120.88255293667319],
            [30.002812514714194, 120.88245637714866],
            [30.003110993462716, 120.8824905753136],
            [30.003425150086173, 120.88227465748788],
            [30.003699237862044, 120.88206209242345],
            [30.004347870535987, 120.88157057762147],
            [30.004527303535017, 120.88143914937976],
            [30.00483797155247, 120.88117964565757],
            [30.005062116471233, 120.8809643983841],
            [30.005353620245426, 120.88079743087293],
            [30.005840232207365, 120.88060162961484],
            [30.00607018165972, 120.88044472038746],
            [30.00640116857213, 120.88011749088767],
            [30.00679428668091, 120.879729911685],
            [30.007261148703957, 120.8792665600777],
            [30.007739041260578, 120.87879717350008],
            [30.00801543979301, 120.8785302937031],
            [30.008312741556484, 120.87830901145936],
            [30.008679141527644, 120.87798379361631],
            [30.009097219081017, 120.87759688496591],
            [30.010024532032766, 120.87692834436895],
            [30.01044144260775, 120.87663263082507],
            [30.010886222709978, 120.87631881237031],
            [30.011422162664243, 120.87593927979471],
            [30.01169797028788, 120.87574616074563],
            [30.01210674480794, 120.87545514106752],
            [30.012570097979737, 120.87513260543348],
            [30.01301312661981, 120.87481543421748],
            [30.013445121186386, 120.87449759244922],
            [30.013852727237726, 120.874190479517],
            [30.01412852810294, 120.87399400770666],
            [30.014587226790788, 120.87381832301618],
            [30.0149268947052, 120.87370969355108],
            [30.01520675696745, 120.87363459169866],
            [30.015563260863168, 120.8734830468893],
            [30.015861701249726, 120.8733717352152],
            [30.016339552372038, 120.87320677936079],
            [30.01688359149089, 120.87300829589368],
            [30.017303956919786, 120.87282791733743],
            [30.017825927534542, 120.87259724736215],
            [30.01811623258297, 120.87248392403129],
            [30.01863239286026, 120.8723659068346],
            [30.01907713623123, 120.87224185466766],
            [30.019326214871807, 120.87214998900893],
            [30.019455108468133, 120.87207958102229],
            [30.019826692672968, 120.87181605398656],
            [30.019897525753972, 120.87175637483598],
            [30.019931781078302, 120.8717154711485],
            [30.02014195755488, 120.87153777480128],
            [30.020491476565407, 120.87124809622765],
            [30.020720811459405, 120.87102144956592],
            [30.02098846493074, 120.87069891393186],
            [30.02129966198471, 120.87030932307246],
            [30.021585892741086, 120.86995124816896],
            [30.021930761966644, 120.86951538920405],
            [30.022524700598815, 120.8686376363039],
            [30.02266171819462, 120.86861014366151],
            [30.02297755464335, 120.86850486695768],
            [30.02337234878941, 120.86808241903783],
            [30.02363476991085, 120.86779274046422],
            [30.023802556502783, 120.86752921342851],
            [30.024028400290657, 120.86710140109065],
            [30.024150901461674, 120.8666601777077],
            [30.024263532736523, 120.8660586923361],
            [30.024360488422214, 120.86580120027065],
            [30.024509695489762, 120.86568653583528],
            [30.02455091607976, 120.86561478674413],
            [30.024555560652185, 120.86560271680356],
            [30.024708831420764, 120.86539819836618],
            [30.024737859948726, 120.86535193026067],
            [30.024771533030535, 120.86513869464399],
            [30.025001438593677, 120.86478464305402],
            [30.02555471924083, 120.8638894557953],
            [30.025755014201785, 120.86340330541135],
            [30.02586996590964, 120.8629855513573],
            [30.025869385345793, 120.86298219859601],
            [30.025977370162686, 120.86257316172124],
            [30.026130058170796, 120.86211919784547],
            [30.026328029724727, 120.86183555424216],
            [30.02655444831931, 120.8616115897894],
            [30.026953292124308, 120.86140036582948],
            [30.027260406566178, 120.86122401058677],
            [30.027173903728894, 120.86105905473234],
            [30.02742876757667, 120.86073517799379],
            [30.02795416820192, 120.85979171097279],
            [30.02821135224418, 120.8592747151852],
            [30.0284859520764, 120.85878387093545],
            [30.028596256234604, 120.85859142243864],
            [30.02876925935129, 120.8582615107298]]
        },
        {
            type: 'PP',
            value: [[29.988630836159576, 120.8984832465649],
            [29.988979885409886, 120.89837260544303],
            [29.989623968076348, 120.89820295572282],
            [29.990033414307725, 120.898097679019],
            [29.990457958900638, 120.89798033237459],
            [29.99090457088359, 120.89785628020765],
            [29.991196697010533, 120.8977670967579],
            [29.991590456115606, 120.89760147035122],
            [29.9918576074215, 120.89746266603471],
            [29.992142180847853, 120.89728966355327],
            [29.992323958956515, 120.8971716463566],
            [29.992508640527923, 120.89703954756261],
            [29.992668929915165, 120.89690811932087],
            [29.992781016180725, 120.8968008309603],
            [29.992910525024286, 120.89667007327083],
            [29.993049906550535, 120.89652456343175],
            [29.99320264524832, 120.89635692536832],
            [29.993365256531394, 120.89616112411024],
            [29.99365795616967, 120.8957923203707],
            [29.993947751191396, 120.89543893933298],
            [29.99412778374478, 120.89518144726755],
            [29.994522692718178, 120.89465707540514],
            [29.994844426220368, 120.89425474405292],
            [29.995070335944373, 120.89396372437479],
            [29.99533747788511, 120.89363180100919],
            [29.995509377536365, 120.89343197643757],
            [29.995646432450403, 120.89327707886697],
            [29.99583575375768, 120.89306920766833],
            [29.996203361277008, 120.89268028736116],
            [29.996604650079473, 120.89226320385934],
            [29.996753898901776, 120.89210763573648],
            [29.99703555462815, 120.8918105810881],
            [29.997264363021603, 120.89156515896323],
            [29.99756285845771, 120.8912365883589],
            [29.997691199604635, 120.89108705520631],
            [29.998121518709684, 120.89062973856926],
            [29.99841768866967, 120.89029982686044],
            [29.99843975619993, 120.89032463729383],
            [29.998510604553424, 120.89046746492387],
            [29.998523380480627, 120.89048288762571],
            [29.998772510732525, 120.89075043797494],
            [29.999185984269158, 120.89119769632818],
            [29.999577388810746, 120.89161545038225],
            [30.000014087604864, 120.89210227131845],
            [30.000364838968146, 120.89253745973112],
            [30.00073242971216, 120.893012881279],
            [30.001052981666604, 120.89351512491704],
            [30.001257391067874, 120.89388191699982],
            [30.00150012668505, 120.8942896127701],
            [30.001773058368375, 120.89482538402082],
            [30.00197456276779, 120.89525923132899],
            [30.00224575103981, 120.89589089155199],
            [30.0024164773234, 120.89635625481607],
            [30.002526810479687, 120.89669018983844],
            [30.00268534158946, 120.89716628193857],
            [30.002872326675433, 120.89785225689414],
            [30.00302040467673, 120.89841887354854],
            [30.003117961827446, 120.89878834784032],
            [30.00327997616936, 120.89938513934614],
            [30.003425150086173, 120.8999363332987],
            [30.003572065873733, 120.90049356222154],
            [30.003703883411024, 120.90097568929197],
            [30.003846733936538, 120.90150676667692],
            [30.004003520861954, 120.90208813548091],
            [30.004130692297277, 120.90255886316302],
            [30.004257863569606, 120.90303964912891],
            [30.00440768157171, 120.90355262160304],
            [30.00461382612731, 120.90367265045646],
            [30.00462543989235, 120.90371757745746],
            [30.0046864121365, 120.90388186275959],
            [30.004707316897292, 120.90394690632822],
            [30.004609761309244, 120.90413130819799],
            [30.004757256030246, 120.90448804199696],
            [30.0049692067218, 120.90490177273752],
            [30.005234579963027, 120.90541407465938],
            [30.00526884035161, 120.90542279183866],
            [30.00526884035161, 120.90542279183866],
            [30.00556208556669, 120.90591765940191],
            [30.0061549608688, 120.90684168040755],
            [30.006468527176985, 120.90732850134374],
            [30.006761188170504, 120.90778447687627],
            [30.007066623128008, 120.90825922787192],
            [30.00736741176793, 120.90872995555402],
            [30.007657747428, 120.90917989611626],
            [30.007928339498225, 120.90958826243879],
            [30.00816002611349, 120.90990811586383],
            [30.0081588647784, 120.90993829071525],
            [30.008433520143413, 120.91029234230521],
            [30.00857868651964, 120.91044723987581],
            [30.008701787440245, 120.91056123375895],
            [30.00902579762378, 120.91086164116861],
            [30.009421227973018, 120.91117814183237],
            [30.009701105769782, 120.91136589646341],
            [30.010047758294718, 120.91157376766206],
            [30.010446668495216, 120.91177225112916],
            [30.01085022230593, 120.91191910207273],
            [30.011174806122096, 120.91201767325404],
            [30.011490679156033, 120.91211356222631],
            [30.011850099638462, 120.91217391192914],
            [30.012401711739102, 120.91225773096086],
            [30.012895837447644, 120.91234490275383],
            [30.013356864384846, 120.91241866350177],
            [30.013630924722374, 120.91253936290742],
            [30.01391137127537, 120.91251656413081],
            [30.014331168670914, 120.91259971261026],
            [30.014515228656087, 120.91263793408872],
            [30.014969861161944, 120.91272108256818],
            [30.015433200958487, 120.9128049015999],
            [30.015438426582932, 120.9127901494503],
            [30.015488940938514, 120.9122195094824],
            [30.015490682812388, 120.91220542788508],
            [30.01592382783205, 120.91225907206535],
            [30.016172914392797, 120.91223895549776],
            [30.016189171768943, 120.91223560273647],
            [30.01638077635854, 120.91220475733282],
            [30.01640922670545, 120.9122007340193],
            [30.016446966948934, 120.91219268739225],
            [30.017049067045026, 120.91199822723868],
            [30.01762387471926, 120.91171793639661],
            [30.018122619284497, 120.91131627559662],
            [30.018377506399936, 120.91115936636928],
            [30.018586524957875, 120.91091193258764],
            [30.019005721960138, 120.91048210859302],
            [30.019290217531196, 120.9102226048708],
            [30.01954394044375, 120.91001942753795],
            [30.019901009346817, 120.90967543423179],
            [30.020151827709945, 120.90947292745115],
            [30.020586694155416, 120.90908534824851],
            [30.021023881062618, 120.90869575738908],
            [30.021023881062618, 120.90869575738908],
            [30.021254956497867, 120.9084503352642],
            [30.021649757502985, 120.9080781787634],
            [30.022465481070846, 120.90744383633137],
            [30.022780156980797, 120.90719103813173],
            [30.02310586291324, 120.90692281723024],
            [30.02355697257116, 120.9066901355982],
            [30.024077749121826, 120.90650573372842],
            [30.024478344607058, 120.90645343065265],
            [30.024870229928517, 120.9064641594887],
            [30.025305656246648, 120.9064842760563],
            [30.02551349906822, 120.90647354722024],
            [30.02551291850229, 120.90640716254713],
            [30.02551233793633, 120.90638302266599],
            [30.0255117573704, 120.9063843637705],
            [30.025507112842757, 120.90615369379522],
            [30.025510015672573, 120.90613089501859],
            [30.025644706882037, 120.90611614286901],
            [30.025778236779765, 120.90611480176449],
            [30.02578404242342, 120.90587608516218],
            [30.025811328944, 120.90583987534046],
            [30.025804942737718, 120.9053771942854],
            [30.025758497588807, 120.9048843383789],
            [30.025627870490872, 120.9042862057686],
            [30.025657479314823, 120.90427815914155],
            [30.025755014201785, 120.9042962640524]]
        },
        {
            type: 'PP',
            value: [[29.980337523517623, 120.90568049987307],
            [29.980541272636277, 120.90485030151912],
            [29.980900828884803, 120.90388519593263],
            [29.981362257496546, 120.90303770177965],
            [29.98177873992218, 120.90241505301418],
            [29.982150276727133, 120.90191347484198],
            [29.98239596965723, 120.90158831382003],
            [29.98313004857109, 120.900886104379],
            [29.983843148605715, 120.90034647544891],
            [29.984460365509847, 120.90000055946813],
            [29.98511053644909, 120.8996546434873],
            [29.985895529790483, 120.89935369658399],
            [29.986917210302668, 120.8989766481649],
            [29.987944872470578, 120.89865840546256],
            [29.988629674595945, 120.89848257601263]]
        },
        {
            type: 'PP',
            value: [[29.977686159545556, 120.9093153315172],
            [29.97766365370845, 120.9068990372017],
            [29.97777618284302, 120.90393712804074],
            [29.97829381522004, 120.9015727970439],
            [29.97941909368971, 120.90081932892399],
            [29.980971957041614, 120.90066343896818],
            [29.982749843240256, 120.9012869987915]]
        },
        {
            type: 'PP',
            value: [[29.980115655092526, 120.9207144730424],
            [29.981209008162896, 120.91784572420138],
            [29.982481258401677, 120.91589497498954],
            [29.98363422110235, 120.91146562677905],
            [29.983733613811886, 120.90894112779901],
            [29.983733613811886, 120.9073575784388],
            [29.98307762009053, 120.90425932969053],
            [29.982381864438675, 120.90253808038595],
            [29.982143318521654, 120.90198728060848]]
        },
        {
            type: 'PP',
            value: [[30.0093846463769, 120.88246911764146],
            [30.009377678452307, 120.88246710598472],
            [30.009387549678685, 120.8824060857296],
            [30.00935038740959, 120.88237524032594],
            [30.00933412891249, 120.88233567774297],
            [30.00936258128068, 120.88202454149724],
            [30.009421227973018, 120.88132314383985],
            [30.009432260515222, 120.88100865483285],
            [30.009517617510838, 120.88032267987728],
            ]
        }



    ]
    return data
}

export function getRealStraightFlowDirectionData() {
    let data = [
        {
            type: 'WW',
            value: [[30.04766445683194, 120.85325853227194],
            [30.043197771299965, 120.8403947505089]]
        },
        {
            type: 'WW',
            value: [[30.032124555692054, 120.8528224718732],
            [30.04300903367358, 120.84024939704267]]
        },
        {
            type: 'WW',
            value: [[30.020808450304106, 120.86122947500427],
            [30.03192435052233, 120.85302981042894]]
        },
        {
            type: 'WW',
            value: [[30.009691303796522, 120.88237597838271],
            [30.020808450304106, 120.86090580403422]]
        },
        {
            type: 'WW',
            value: [[29.995676318771924, 120.87978661062209],
            [30.00959787711757, 120.88226808805936]]
        },
        {
            type: 'WW',
            value: [[29.980257549301122, 120.9210007141454],
            [29.97820153246969, 120.91010379148611]]
        },
        {
            type: 'WW',
            value: [[29.978087021118995, 120.91048686126467],
            [29.980389467324553, 120.90561995430822]]
        },
        {
            type: 'WW',
            value: [[29.98035703887534, 120.90565739205402],
            [29.98875565343634, 120.89839446936521]]
        },
        {
            type: 'WW',
            value: [[29.9885935247444, 120.89850678260262],
            [29.99575936015211, 120.87982534743905]]
        },
        {
            type: 'WW',
            value: [[30.02582190664302, 120.90429874375917],
            [30.028252281297085, 120.89686366912079]]
        },
        {
            type: 'WW',
            value: [[30.02582190664302, 120.90429874375917],
            [30.028252281297085, 120.89686366912079]]
        },
        {
            type: 'WW',
            value: [[30.028252281297085, 120.89686366912079],
            [30.019450101050502, 120.88730428744294]]
        },
        {
            type: 'WW',
            value: [[30.019450101050502, 120.88730428744294],
            [30.009464592487983, 120.88214525606122]]
        }



    ]
    return data
}

export function getRealStraightFlowDirectionData2() {
    let data = [
        {
            type: 'WW',
            value: [[30.047603481557964, 120.85364499087783],
            [30.043369889966428, 120.84031523500197]]
        },
        {
            type: 'WW',
            value: [[30.03191338207591, 120.85268601563494],
            [30.043369889966428, 120.84021933747768]]
        },
        {
            type: 'WW',
            value: [[30.037392746761704, 120.85978243243218],
            [30.031996405013277, 120.85278191315925]]
        },
        {
            type: 'WW',
            value: [[30.009162477487422, 120.8827019407367],
            [30.032162450679422, 120.85268601563494]]
        },
        {
            type: 'WW',
            value: [[29.995874864044612, 120.87953732243521],
            [30.009826811450047, 120.88260604321243]]
        },
        {
            type: 'WW',
            value: [[29.988815095750944, 120.89823733967116],
            [30.0256864635743, 120.90427888370121]]
        },
        {
            type: 'WW',
            value: [[30.02593554782469, 120.9043747812255],
            [30.028343329979446, 120.89679887680686]]
        },
        {
            type: 'WW',
            value: [[30.019459153925755, 120.88768861199965],
            [30.028343329979446, 120.89689477433114]]
        },
        {
            type: 'WW',
            value: [[30.02829909158072, 120.89681933380605],
            [30.03432672309951, 120.8869850748592]]
        },
        {
            type: 'WW',
            value: [[30.034100693533148, 120.88707210369947],
            [30.032141749030306, 120.85291328390612]]
        },
        {
            type: 'WW',
            value: [[30.028509381765385, 120.87301629078377],
            [30.032411518657028, 120.85306960573209]]
        }



    ]
    return data
}

/**
 * paint color on the pipline network map layer
 * @param {string} start_point_name 
 * @returns 
 */
export function pipelineColorMapping(start_point_name) {
    //let topLayer = ['WSC0451', 'WSC0452', 'WSC0451', 'WSC0455', 'WSC0456', 'WSC0459', 'WSC0460', 'WSC0461', 'WSC0462', 'WSC0463', 'WSC0464', 'WSC0465', 'WSC0465', 'WSC0467', 'WSC0468', 'WSC0469', 'WSC0470', 'WSC041727', 'WSC041720', 'WSC04128', 'WSC041752', 'WSC041751', 'WSC041750', 'WSC041754', 'WSC041756', 'WSC041759', 'WSC041720', 'WSC041704', 'WSC041701', 'WSC041728', 'WSC1536', 'WSC041741', 'WSC041740', 'WSC041739', 'WSC041738', 'WSC041736', 'WSC041735', 'WSC041732', 'WSC041731', 'WSC041729', 'WSC052040', 'WSC052042', 'WSC052044', 'WSC052046', 'WSC052047', 'WSC052154', 'WSC052155', 'WSC052156', 'WSC052043', 'WSC0533', 'WSC052157', 'WSC052158', 'WSC052041', 'WSC041760', 'WSC052810', 'WSC1537']
    //let bottomLayer = ['WSC04215', 'WSC04216', 'WSC04217', 'WSC04220', 'WSC04221', 'WSC04224', 'WSC04225', 'WSC04227', 'WSC04229', 'WSC041613', 'WSC04276', 'WSC04281', 'WSC04284', 'WSC04288', 'WSC04292', 'WSC04294', 'WSC04295', 'WSC041500', 'WSC04299', 'WSC04301', 'WSC04304', 'WSC04305', 'WSC04306', 'WSC04342', 'WSC041607', 'WSC041606', 'WSC041605', 'WSC041604', 'WSC041603', 'WSC041602', 'WSC041612', 'WSC05230', 'WSC051970', 'WSC051971', 'WSC051976', 'WSC051977', 'WSC051979', 'WSC052039', 'WSC052049', 'WSC052050', 'WSC052051', 'WSC052053', 'WSC052054', 'WSC052056', 'WSC052058', 'WSC052059', 'WSC052060', 'WSC0517', 'WSC052062', 'WSC052067', 'WSC052070', 'WSC052072', 'WSC05203', 'WSC052075', 'WSC052078', 'WSC05232', 'WSC052081', 'WSC052083', 'WSC052084', 'WSC052089', 'WSC052096', 'WSC052100', 'WSC052103', 'WSC15117']
    let colors = ['#ba5372', '#af5d8f', '#9a6ec0', '#606cbd', '#1d6ab7', '#2d8cb9', '#5fb5c0']

    //pipe start points 1 with highest pipe filling
    let pipesps1 = ['WSC0414', 'WSC0418', 'WSC0419', 'WSC0430', 'WSC0431', 'WSC0516', 'WSC0517', 'WSC0519', 'WSC0520', 'WSC0521', 'WSC0522', 'WSC0523', 'WSC0524', 'WSC0525', 'WSC0526', 'WSC0531', 'WSC0533', 'WSC0534', 'WSC1510', 'WSC1511', 'WSC1512', 'WSC1513', 'WSC1514', 'WSC1527', 'WSC1574', 'WSC1575', 'WSC1576', 'WSC1577', 'WSC1578', 'WSC1579', 'WSC1580', 'WSC2015']
    let pipesps1a = ['WSC152', 'WSC153', 'WSC154', 'WSC155', 'WSC156', 'WSC157', 'WSC158']
    let pipesps1b = ['WSC0512', 'WSC0515', 'WSC1515', 'WSC1516', 'WSC1517', 'WSC1591', 'WSC1592', 'WSC1593', 'WSC1594', 'WSC1595', 'WSC1596', 'WSC1597', 'WSC1598']
    //pipe start points 2 with higher pipe filling
    let pipesps2 = ['WSC0413', 'WSC0415', 'WSC0416', 'WSC0417', 'WSC0431', 'WSC0433', 'WSC0434', 'WSC0456', 'WSC0460', 'WSC0461', 'WSC0462', 'WSC0463', 'WSC0464', 'WSC0465', 'WSC0466', 'WSC0467', 'WSC0469', 'WSC0478', 'WSC0480', 'WSC0481', 'WSC0482', 'WSC0501', 'WSC0502', 'WSC0503', 'WSC0504', 'WSC0505', 'WSC0506', 'WSC0507', 'WSC0508', 'WSC0509', 'WSC0510', 'WSC0511', 'WSC0518', 'WSC0527', 'WSC0528', 'WSC0529', 'WSC0535', 'WSC0537', 'WSC0538', 'WSC0540', 'WSC0541', 'WSC0542', 'WSC0543', 'WSC0544', 'WSC0545', 'WSC0546', 'WSC0547', 'WSC0548', 'WSC0549', 'WSC0550', 'WSC0551', 'WSC0552', 'WSC0553', 'WSC0554', 'WSC0555', 'WSC0556', 'WSC0557', 'WSC0558', 'WSC0559', 'WSC0560', 'WSC1536', 'HSC0434', 'HSC0435', 'HSC0436', 'HSC0441', 'HSC0442', 'HSC0443', 'HSC0444', 'HSC0471', 'HSC0472', 'HSC0478', 'HSC0479', 'HSC0480', 'HSC0518', 'HSC0519', 'HSC0520']
    let pipesps2a = ['WSC042', 'HSC041', 'HSC044', 'HSC047']
    let pipesps2b = ['WSC04276', 'WSC1518', 'WSC1519']
    //pipe start points 3 with high pipe filling
    let pipesps3 = ['WSC0410', 'WSC0411', 'WSC0412', 'WSC0446', 'WSC0447', 'WSC0448', 'WSC0449', 'WSC0450', 'WSC0451', 'WSC0452', 'WSC0453', 'WSC0454', 'WSC0455', 'WSC0457', 'WSC0458', 'WSC0459', 'WSC0468', 'WSC0470', 'WSC0473', 'WSC0474', 'WSC0475', 'WSC0476', 'WSC0477', 'WSC0483', 'WSC0484', 'WSC0485', 'WSC0486', 'WSC0487', 'WSC0491', 'WSC0492', 'WSC0493', 'WSC0494', 'WSC0495', 'WSC0496', 'WSC0512', 'WSC0513', 'WSC0514', 'WSC0561', 'WSC0562', 'WSC0563', 'WSC0564', 'WSC0565', 'WSC0566', 'WSC0567', 'WSC0568', 'WSC0569', 'WSC0570', 'WSC0572', 'WSC0575', 'WSC0576', 'WSC0577', 'WSC0578', 'WSC0580', 'WSC0581', 'WSC0582', 'WSC0583', 'WSC0585', 'WSC0586', 'WSC0587', 'WSC0588', 'WSC0589', 'WSC0591', 'WSC0592', 'WSC0595', 'WSC0596', 'WSC0832', 'WSC0834', 'WSC0835', 'WSC0836', 'WSC0837', 'WSC0838', 'WSC0839', 'WSC1120', 'WSC1122', 'WSC1126', 'WSC1127', 'WSC1129', 'WSC1130', 'WSC1131', 'WSC1132', 'WSC1133', 'WSC1134', 'WSC1135', 'WSC1136', 'WSC1137', 'WSC1523', 'WSC1524', 'WSC1525', 'WSC1740', 'WSC1741', 'WSC1742', 'WSC1743', 'WSC1744', 'WSC1745', 'WSC1746', 'WSC1747', 'WSC1748', 'WSC1749', 'WSC1750', 'WSC1777', 'WSC1778', 'WSC1889', 'WSC1890', 'WSC1891', 'HSC0410', 'HSC0411', 'HSC0412', 'HSC0413', 'HSC0437', 'HSC0438', 'HSC0439', 'HSC0440', 'HSC0453', 'HSC0454', 'HSC0460', 'HSC0461', 'HSC0462', 'HSC0463', 'HSC0464', 'HSC0465', 'HSC0466', 'HSC0467', 'HSC0468', 'HSC0469', 'HSC0470', 'HSC0488', 'HSC0489', 'HSC0490', 'HSC0491', 'HSC0493', 'HSC0494', 'HSC0495', 'HSC0496', 'HSC0497', 'HSC0498', 'HSC0499', 'HSC0514', 'HSC0515', 'HSC0516', 'HSC0517', 'HSC0522', 'HSC0524', 'HSC0546', 'HSC0547', 'HSC0548', 'HSC0549', 'HSC0550', 'HSC0551', 'HSC0552', 'HSC0553', 'HSC0554', 'HSC0555', 'HSC0556', 'HSC0557', 'HSC0558', 'HSC0559', 'HSC0560', 'HSC0561', 'HSC0562', 'HSC1011', 'HSC1028', 'HSC1047', 'HSC1048', 'HSC1049', 'HSC1050']
    let pipesps3a = ['WSC159']
    let pipesps3b = ['WSC0427', 'WSC05150', 'WSC05151', 'WSC05152', 'WSC05153', 'WSC05154', 'WSC05155', 'WSC05156', 'WSC05157', 'WSC05158', 'WSC05159', 'WSC1520', 'WSC1521', 'WSC1522', 'WSC15228']
    //pipe start points 4 with medium pipe filling
    let pipesps4 = ['WSC1017', 'WSC1018', 'WSC1019', 'WSC1020', 'WSC1021', 'WSC1022', 'WSC1023', 'WSC1024', 'WSC1025', 'WSC1026', 'WSC1027', 'WSC1028', 'WSC1029', 'WSC1030', 'WSC1031', 'WSC1032', 'WSC1033', 'WSC1034', 'WSC1035', 'WSC1036', 'WSC1037', 'WSC1038', 'WSC1039', 'WSC1040', 'WSC1526', 'WSC1568', 'WSC1569', 'WSC1570', 'WSC1571', 'WSC1572', 'WSC1573', 'WSC1750', 'WSC1751', 'WSC1752', 'WSC1753', 'WSC1754', 'WSC1779', 'WSC1780', 'WSC1781', 'WSC1782', 'WSC1783', 'WSC1784', 'WSC1785', 'WSC1786', 'WSC1787', 'WSC1788', 'WSC1797', 'WSC1888', 'HSC0510', 'HSC0511', 'HSC0512', 'HSC0513', 'HSC0525', 'HSC0526', 'HSC0527', 'HSC0529', 'HSC0530', 'HSC0531', 'HSC0532', 'HSC0533', 'HSC0534', 'HSC0535', 'HSC0536', 'HSC0537', 'HSC0538', 'HSC0539', 'HSC0540', 'HSC0541', 'HSC0542', 'HSC0543', 'HSC0544', 'HSC0545', 'HSC0598', 'HSC0599', 'HSC1029', 'HSC1030', 'HSC1031', 'HSC1032', 'HSC1033', 'HSC1034', 'HSC1035', 'HSC1036', 'HSC1037', 'HSC1038', 'HSC1039', 'HSC1040', 'HSC1041', 'HSC1042', 'HSC1043', 'HSC1044', 'HSC1045', 'HSC1046', 'HSC1051', 'HSC1052', 'HSC1053', 'HSC1754', 'HSC1755', 'HSC1756', 'HSC1757', 'HSC1758', 'HSC1759', 'HSC1779']
    let pipesps4a = ['WSC101', 'WSC102', 'WSC103', 'WSC104', 'WSC105', 'WSC106', 'WSC107']
    //pipe start points 5 with low pipe filling
    //pipe start points 6 with lower pipe filling
    //pipe start points 7 with lowest pipe filling
    let pipesps7 = ['WSC0411', 'WSC0426', 'WSC0427', 'WSC1520', 'WSC1521', 'WSC1522']
    let color = '#5fb5c0'

    if (pipesps1b.includes(start_point_name)) {
        color = colors[0]
    } else if (pipesps2b.includes(start_point_name)) {
        color = colors[1]
    } else if (pipesps3b.includes(start_point_name)) {
        color = colors[2]
    } else if (pipesps1.includes(start_point_name.substring(0, 7))) {
        color = colors[0]
    } else if (pipesps2.includes(start_point_name.substring(0, 7))) {
        color = colors[1]
    } else if (pipesps3.includes(start_point_name.substring(0, 7))) {
        color = colors[2]
    } else if (pipesps4.includes(start_point_name.substring(0, 7))) {
        color = colors[3]
    } else if (pipesps7.includes(start_point_name.substring(0, 7))) {
        color = colors[6]
    } else if (pipesps1a.includes(start_point_name.substring(0, 6))) {
        color = colors[0]
    } else if (pipesps2a.includes(start_point_name.substring(0, 6))) {
        color = colors[1]
    } else if (pipesps3a.includes(start_point_name.substring(0, 6))) {
        color = colors[2]
    } else if (pipesps4a.includes(start_point_name.substring(0, 6))) {
        color = colors[3]
    }

    return color
}