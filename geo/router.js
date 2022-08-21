import React from 'react'
import { Router } from 'dva/router'
import BaseLayout from './pages/layout/BaseLayout'

function RouterConfig ({ history }) {
    return (
        <Router history={history}>
            <BaseLayout/>
        </Router>
    )
}

export default RouterConfig
