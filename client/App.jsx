import React from "react";
import Router from "./Route/index.js";
import Header from "./Components/Header/index.jsx";
import "./App.css";

const App = () => {
  return [
    <Header key="header" />,
    <Router key="router" />
  ];
};

export default App;
