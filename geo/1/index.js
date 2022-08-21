/* eslint-disable import/first */
import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'

import dva from 'dva'
import axios from 'axios'
import qs from 'qs'
import RouterConfig from './router'
import 'antd'

import './assets/css/theme.dark.global.less'
// import './assets/css/theme.default.global.less'
import './assets/css/main.less'
import { apiHost } from './utils/request'
import moment from 'moment'
//import AdobeLaunch from "adobe-launch-tag-manager"
import AdobeLaunch from './utils/adobe-launch/main'

import Cookies from 'js-cookie'

// 1. Initialize
const app = dva({
    // history: createHistory(),
})

// 2. Plugins
// app.use({});

// 3. Model
app.model(require('./models/LayoutModel').default)
app.model(require('./models/UserModel').default)
app.model(require('./models/LangModel').default)

// 4. Router
app.router(RouterConfig)

// config axios
axios.defaults.withCredentials = true
axios.defaults.baseURL = apiHost
axios.defaults.paramsSerializer = (params) => {
    return qs.stringify(params, { arrayFormat: 'brackets' })
}
AdobeLaunch.initialize()
axios.interceptors.response.use(data => {
    if (data.config.method === 'get') {
        if(document.getElementById('js-time-lastUpdate')){
            document.getElementById('js-time-lastUpdate').innerHTML = moment().format('YYYY-MM-DD HH:mm:ss')
        }
        if(document.getElementById('js-time-lastUpdate2')){
            document.getElementById('js-time-lastUpdate2').innerHTML = moment().format('YYYY-MM-DD HH:mm:ss')
        }
        
    }
    return data
}, err => {
    if (err.response) {
        return Promise.reject(err)
    } else {
        err.response = { data: { message: err.message } }
        return Promise.reject(err)
    }
})

axios.defaults.headers.common["X-CSRFToken"] = window.xsrfToken;

// Set cookie lang as chinese default
if(!Cookies.get('_lang')) {
    Cookies.set('_lang', 'zh-CN')
}

// 5. Start
app.start('#root')
