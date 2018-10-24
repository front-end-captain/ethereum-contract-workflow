import React from "react";
import { Link } from "react-router-dom";
import "./index.css";

const Header = () => {
  return (
    <div className="header">
      <p>
        <Link to="/">Home</Link>
      </p>
      <p>
        <Link to="/projects/create">发起项目</Link>
      </p>
    </div>
  );
};

export default Header;
