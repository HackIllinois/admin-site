import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBell, faCalendar, faBars, faCalculator } from '@fortawesome/free-solid-svg-icons';

import './App.scss';
import logo from './assets/logo.svg';
import PrivateRoute from './components/PrivateRoute';
import Auth from './components/Auth';
import Users from './components/Users';
import Events from './components/Events';
import Notifications from './components/Notifications';
import Statistics from 'components/Statistics';

const routes = [
  { path: '/', name: "Statistics", icon: faCalculator },
  { path: '/users', name: "Users", icon: faUsers },
  { path: '/notifications', name: "Notifications", icon: faBell },
  { path: '/events', name: "Events", icon: faCalendar },
]

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
    };
  }

  render() {
    const { menuOpen } = this.state;
    return (
      <div className="App">
        <BrowserRouter className="router">
          <div className="menu-open-button" onClick={() => this.setState({ menuOpen: true })}>
            <FontAwesomeIcon icon={faBars} fixedWidth/>
            <div className="highlight"/>
          </div>

          <div
            className={'menu-background' + (menuOpen ? ' open' : '')}
            onClick={() => this.setState({ menuOpen: false })}/>
  
          <div className={'navigation-menu-container' + (menuOpen ? ' open' : '')}>
            <div className="navigation-menu">
              <div className="logo">
                <img src={logo} alt="HackIllinois Logo"/>
              </div>
              {
                routes.map(route => (
                  <NavLink
                    exact
                    to={route.path}
                    className="navigation-link"
                    activeClassName="active"
                    onClick={() => this.setState({ menuOpen: false })}
                    key={route.name}>
                      <FontAwesomeIcon icon={route.icon} fixedWidth/>
                      <span className="text">&nbsp; {route.name}</span>
                  </NavLink>
                ))
              }
            </div>
          </div>
  
          <Switch>
            <Route path="/auth" component={Auth}></Route>
            
            <PrivateRoute exact path="/">
              <Statistics/>
            </PrivateRoute>
            
            <PrivateRoute path="/users">
              <Users/>
            </PrivateRoute>
  
            <PrivateRoute path="/events">
              <Events/>
            </PrivateRoute>
  
            <PrivateRoute path="/notifications">
              <Notifications/>
            </PrivateRoute>
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
