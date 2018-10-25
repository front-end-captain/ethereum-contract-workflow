import React from "react";
import { Link } from "react-router-dom";
import "./index.css";

const Header = () => {
  return (
    <div className="header">
      <div className="header-container">
        <div className="title-container">
          <h1>DApp</h1>
          <div className="line" />
          <span><Link to="/">项目列表</Link></span>
        </div>
        <div className="create-project-container">
          <Link to="/projects/create">发起项目</Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
