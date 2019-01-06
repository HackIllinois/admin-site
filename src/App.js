import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Auth from './components/Auth';
import MenuAppBar from './components/MenuAppBar';
import Menu from './components/Menu';

import Home from './scenes/Home';
import Login from './scenes/Login';
import Events from './scenes/Events';
import Announcements from './scenes/Announcements';

import './styles.css';

class App extends Component {
  render() {
    return (
        <BrowserRouter>
          <div>
            <MenuAppBar />
            <Menu />
            <Auth />
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/events" component={Events} />
              <Route path="/announcements" component={Announcements} />
            </Switch>
          </div>
        </BrowserRouter>
    );
  }
}

export default App;
