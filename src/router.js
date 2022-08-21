import React from "react";
import { Router } from "dva/router";
import App from "./App";

function RouterConfig({ history }) {
	return (
		<Router history={history}>
			<App />
		</Router>
	);
}

export default RouterConfig;
