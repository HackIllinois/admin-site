import React from 'react'
import { isAuthenticated, authenticate, getRoles, getUserId } from 'util/api'

// TODO: make distinction between google auth and github auth clearer

// checks if the user's token matches the desired provider
const isDesiredAuthentication = (provider) =>
    getUserId().startsWith(provider)

const AuthenticatedRoute = ({ path, provider = 'google', ...props }) => {
    // make sure user is authenticated, and that their authentication provider matches the desired one
    if (!isAuthenticated() || !isDesiredAuthentication(provider)) {
        authenticate(path, provider)
        return <div>Loading</div>
    }

    // indicates that the route is private (only for Staff and Admin)
    if (provider === 'google') {
        const roles = getRoles()
        if (roles.includes('STAFF') || roles.includes('ADMIN')) {
            return <React.Fragment {...props} />
        } else {
            window.location.replace('https://hackillinois.org/')
            return
        }
    }

    // otherwise provider is github, indicating that the route is open to all
    return <React.Fragment {...props} />
}

export default AuthenticatedRoute
