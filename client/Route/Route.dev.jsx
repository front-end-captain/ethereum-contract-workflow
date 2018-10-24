import React from "react";
import { Switch, Route } from "react-router-dom";
import ProjectList from "./../Pages/ProjectList/index.jsx";

const DevRouter = () => {
  return (
    <Switch>
      <Route
        path="/"
        component={ProjectList}
      />
      <Route
        path="/projects/create"
        render={() => <div>创建项目页面</div>}
      />
      <Route
        path="/projects/:address"
        render={() => <div>创建详情页面</div>}
      />
      <Route
        path="/projects/:address/payments/create"
        render={() => <div>创建资金支出请求页面</div>}
      />
    </Switch>
  );
};

export default DevRouter;
