import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Auth from './components/Auth';
import MenuAppBar from './components/MenuAppBar';
import Menu from './components/Menu';

import Home from './scenes/Home';
import Login from './scenes/Login';
import Admissions from './scenes/Admissions';
import Events from './scenes/Events';

import './styles.css';

class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <MenuAppBar />
            <Menu />
            <Auth />
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/admissions" component={Admissions} />
              <Route path="/events" component={Events} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
