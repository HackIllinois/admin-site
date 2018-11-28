import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import MenuAppBar from './components/MenuAppBar';
import Menu from './components/Menu';

import Home from './scenes/Home';
import Login from './scenes/Login';
import Admissions from './scenes/Admissions';

import './styles.css';

class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <MenuAppBar />
            <Menu />
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/admissions" component={Admissions} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
