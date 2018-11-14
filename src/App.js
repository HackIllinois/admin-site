import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Auth from './components/Auth';
import MenuAppBar from './components/MenuAppBar';
import Menu from './components/Menu';

import Home from './scenes/Home';
import Login from './scenes/Login'

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
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
