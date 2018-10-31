import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import MenuAppBar from './components/MenuAppBar';
import TemporaryDrawer from './components/TemporaryDrawer';

import Home from './scenes/Home';
import Login from './scenes/Login'

import './styles.css';

class App extends Component {
  render() {
    return (
      <div>
        <MenuAppBar />
        <TemporaryDrawer />
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/login" component={Login} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
