import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import MenuAppBar from './components/MenuAppBar';
import Menu from './components/Menu';

import Home from './scenes/Home';
import Login from './scenes/Login'

import './styles.css';

class App extends Component {
  render() {
    const { jwt } = this.props;

    return (
      <div>
        <BrowserRouter>
          <div>
            <MenuAppBar />
            <Menu />
            { jwt ? null : <Redirect to="/login" /> }
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

const mapStateToProps = (state) => ({
  jwt: state.auth.jwt,
});

export default connect(mapStateToProps, null)(App);
