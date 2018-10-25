import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App.jsx";

const ROOT_NODE = document.getElementById("root");

const render = function render(Component) {
  ReactDOM.render(
    <Router>
      <Component />
    </Router>,
    ROOT_NODE,
  );
};

render(App);
