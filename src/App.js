import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCalendar,
    faBars,
    faShoppingCart,
    faUsers,
    faBell,
    faKey,
} from '@fortawesome/free-solid-svg-icons' // faUsers, faCalculator, faSplotch, faBell,

import './App.scss'
import logo from './assets/logo.svg'
import AuthenticatedRoute from 'components/AuthenticatedRoute'
import Auth from './components/Auth'
import Events from './scenes/Events'
import Notifications from './scenes/Notifications'
import Token from 'scenes/Token'
import Shop from 'scenes/Shop'
import Admissions from 'scenes/Admissions'
// import Users from './scenes/Users';
// import Statistics from 'scenes/Statistics';

const routes = [
    // { path: '/', name: "Statistics", icon: faCalculator },
    // { path: '/users', name: "Users", icon: faUsers },
    { path: '/', name: 'Admissions', icon: faUsers },
    { path: '/notifications', name: 'Notifications', icon: faBell },
    { path: '/events', name: 'Events', icon: faCalendar },
    { path: '/shop', name: 'Shop', icon: faShoppingCart },
    { path: '/token', name: 'Token', icon: faKey },
]

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            menuOpen: false,
        }
    }

    render() {
        const { menuOpen } = this.state
        return (
            <div className="App">
                <BrowserRouter className="router">
                    <div
                        className="menu-open-button"
                        onClick={() => this.setState({ menuOpen: true })}
                    >
                        <FontAwesomeIcon icon={faBars} fixedWidth />
                        <div className="highlight" />
                    </div>

                    <div
                        className={
                            'menu-background' + (menuOpen ? ' open' : '')
                        }
                        onClick={() => this.setState({ menuOpen: false })}
                    />

                    <div
                        className={
                            'navigation-menu-container' +
                            (menuOpen ? ' open' : '')
                        }
                    >
                        <div className="navigation-menu">
                            <div className="logo">
                                <img src={logo} alt="HackIllinois Logo" />
                            </div>
                            {routes.map((route) => (
                                <NavLink
                                    to={route.path}
                                    className={({ isActive }) =>
                                        isActive
                                            ? 'navigation-link active'
                                            : 'navigation-link'
                                    }
                                    onClick={() =>
                                        this.setState({ menuOpen: false })
                                    }
                                    key={route.name}
                                >
                                    <FontAwesomeIcon
                                        icon={route.icon}
                                        fixedWidth
                                    />
                                    <span className="text">
                                        &nbsp; {route.name}
                                    </span>
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <Routes>
                        <Route path="/auth" element={<Auth />}></Route>

                        {/* <AuthenticatedRoute path="/" exact>
              <Statistics/>
            </AuthenticatedRoute>
             */}

                        <Route
                            path="/events"
                            element={
                                <AuthenticatedRoute path="/events">
                                    <Events />
                                </AuthenticatedRoute>
                            }
                        />

                        <Route
                            path="/notifications"
                            element={
                                <AuthenticatedRoute path="/notifications">
                                    <Notifications />
                                </AuthenticatedRoute>
                            }
                        />

                        <Route
                            path="/shop"
                            element={
                                <AuthenticatedRoute path="/shop">
                                    <Shop />
                                </AuthenticatedRoute>
                            }
                        />

                        <Route
                            path="/"
                            element={
                                <AuthenticatedRoute path="/">
                                    <Admissions />
                                </AuthenticatedRoute>
                            }
                        />

                        <Route
                            path="/token"
                            element={
                                <AuthenticatedRoute path="/token">
                                    <Token />
                                </AuthenticatedRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </div>
        )
    }
}

export default App
