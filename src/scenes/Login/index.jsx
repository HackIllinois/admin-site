import React from 'react';
import { Link } from 'react-router-dom';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CardMedia from '@material-ui/core/CardMedia';

import './styles.css';
import logo from '../../assets/logo.png';

const Login = () => (
    <div className="flexbox-center" id="card-container">
        <Card id="card">
            {/* Logo */}
            <CardMedia
                className="center"
                id="card-logo"
                image={logo}
                title="HackIllinois"
            />

            {/* Login Form */}
            <CardContent className="flexbox-columns" id="card-content">
                <div id="card-form">
                    {/* Email */}
                    <TextField
                        label="Email"
                        type="email"
                        name="email"
                        className="center text-fields"
                        autoComplete="email"
                        margin="normal"
                        variant="outlined"
                    />
                    <Typography color="inherit" className="forgot-info">
                        <Link to="/forgot">Forgot Email?</Link>
                    </Typography>

                    {/* Password */}
                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        className="center text-fields"
                        margin="normal"
                        variant="outlined"
                    />
                    <Typography color="inherit" className="forgot-info">
                        <Link to="/forgot">Forgot Password?</Link>
                    </Typography>

                    {/* Login Button */}
                    <Button className="center" id="login" variant="contained" color="primary">
                        Login
                    </Button>

                    {/* Signup Link */}
                    <Typography color="inherit" id="signup">
                        <Link to="/signup">Sign Up</Link>
                    </Typography>
                </div>
            </CardContent>
        </Card>
    </div>
);

export default Login;
