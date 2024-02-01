import React from "react";
import queryString from "query-string";
import Loading from "components/Loading";

export default class Auth extends React.Component {
    componentDidMount() {
        const { token } = queryString.parse(window.location.search);

        // these are set in `authenticate` in util/api
        const { to } = localStorage;

        if (token) {
            sessionStorage.setItem("token", token);
            localStorage.removeItem("to");

            if (to) {
                window.location.replace(to);
            } else {
                window.location.replace(window.location.origin);
            }
        }
    }

    render() {
        return <Loading />;
    }
}
