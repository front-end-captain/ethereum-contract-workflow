import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { AppContainer } from "react-hot-loader";

import App from "./App.jsx";

const ROOT_NODE = document.getElementById("root");

const render = function render(Component) {
  ReactDOM.render(
    <AppContainer>
      <Router>
        <Component />
      </Router>
    </AppContainer>,
    ROOT_NODE,
  );
};

render(App);

if (module.hot) {
  module.hot.accept("./App.jsx", () => {
    const NextApp = require("./App.jsx").default;
    render(NextApp);
  });
}
