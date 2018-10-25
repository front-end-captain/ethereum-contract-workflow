import React from "react";
import { hot } from "react-hot-loader";
import Router from "./Route/index.js";
import Header from "./Components/Header/index.jsx";
import "./App.css";

const App = () => {
  return [
    <Header key="header" />,
    <div key="app-container" className="app-wrapper">
      <Router />
    </div>
  ];
};

export default hot(module)(App);
