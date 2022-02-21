import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBell, faCalendar, faBars, faCalculator, faSplotch } from '@fortawesome/free-solid-svg-icons';

import './App.scss';
import logo from './assets/logo.svg';
import AuthenticatedRoute from 'components/AuthenticatedRoute';
import Auth from './components/Auth';
import Users from './scenes/Users';
import Events from './scenes/Events';
import Notifications from './scenes/Notifications';
import Statistics from 'scenes/Statistics';
import Token from 'scenes/Token';
import Blobstore from 'scenes/Blobstore';

const routes = [
  { path: '/', name: "Statistics", icon: faCalculator },
  { path: '/users', name: "Users", icon: faUsers },
  { path: '/notifications', name: "Notifications", icon: faBell },
  { path: '/events', name: "Events", icon: faCalendar },
  { path: '/blobstore', name: "Blobstore", icon: faSplotch },
];

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
            
            <AuthenticatedRoute path="/" exact>
              <Statistics/>
            </AuthenticatedRoute>
            
            <AuthenticatedRoute path="/users">
              <Users/>
            </AuthenticatedRoute>
  
            <AuthenticatedRoute path="/events">
              <Events/>
            </AuthenticatedRoute>
  
            <AuthenticatedRoute path="/notifications">
              <Notifications/>
            </AuthenticatedRoute>

            <AuthenticatedRoute path="/blobstore">
              <Blobstore />
            </AuthenticatedRoute>

            <AuthenticatedRoute path="/token" provider="github">
              <Token />
            </AuthenticatedRoute>
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
