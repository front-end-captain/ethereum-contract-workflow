import React from "react";
import { Switch, Route } from "react-router-dom";
import ProjectList from "./../Pages/ProjectList/index.jsx";
import ProjectDetail from "./../Pages/ProjectDetail/index.jsx";
import CreateProject from "./../Pages/CreateProject/index.jsx";

const DevRouter = () => {
  return (
    <Switch>
      <Route
        path="/"
        exact={true}
        component={ProjectList}
      />
      <Route
        path="/projects/create"
        exact={true}
        component={CreateProject}
      />
      <Route
        exact={true}
        path="/projects/:address"
        component={ProjectDetail}
      />
      <Route
        exact={true}
        path="/projects/:address/payments/create"
        render={() => <div>创建资金支出请求页面</div>}
      />
    </Switch>
  );
};

export default DevRouter;
