import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Home from './scenes/Home';
import Login from './scenes/Login'

import './styles.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
