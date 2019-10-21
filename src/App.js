import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/"></Route>
          <Route path="/users"></Route>
          <Route path="/notifications"></Route>
          <Route path="/events"></Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
