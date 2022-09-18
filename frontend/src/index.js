// import React from "react";
// import ReactDOM from "react-dom/client";
import "./index.css";
// import App from "./App";
import RouterConfig from "./router";
import dva from "dva";

const app = dva({
	// history: createHistory(),
});

// 4. Router
app.router(RouterConfig);

// 5. Start
app.start("#root");
