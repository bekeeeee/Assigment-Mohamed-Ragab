import { Route, Switch, Redirect } from "react-router-dom";
import "./App.css";
import Board from "./components/Board";

function App() {
  return (
    <div>
      <Switch>
        <Route path="/:team_id/:user_id" component={Board} />
        <Redirect to="/not-found" />
      </Switch>
    </div>
  );
}

export default App;
