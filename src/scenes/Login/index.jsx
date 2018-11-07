import React from 'react';
import { Link } from 'react-router-dom';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CardMedia from '@material-ui/core/CardMedia';

import '../../styles/login.css';
import logo from '../../assets/logo.png';

const Login = () => (
    <Card id="card">
        {/* Title */}
        <AppBar position="static" color="default">
            <Toolbar>
                <Typography variant="h6" color="inherit">
                    HackIllinois Admin Portal
                </Typography>
            </Toolbar>
        </AppBar>

        {/* Logo */}
        <CardMedia
          className="center"
          id="logo"
          image={logo}
          title="HackIllinois"
        />

        {/* Login Form */}
        <CardContent className="center" id="card-content">
            <div id="form-input-div">
                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    className="center text-fields"
                    autoComplete="email"
                    margin="normal"
                    variant="outlined"
                />
                <Typography color="inherit">
                    <Link id="forgot" to="/forgot">Forgot Email?</Link>
                </Typography>
                <br />
                <TextField
                    label="Password"
                    type="password"
                    name="password"
                    className="center text-fields"
                    margin="normal"
                    variant="outlined"
                />
                <Typography color="inherit">
                    <Link id="forgot" to="/forgot">Forgot Password?</Link>
                </Typography>

                <br />
                <br />
                <br />

                {/* Login Button */}
                <Button className="center" variant="contained" color="primary">
                    Login
                </Button>
                
                <br />
                <br />

                {/* Signup Link */}
                <Typography color="inherit">
                    <Link to="/signup">Sign Up</Link>
                </Typography>
            </div>
        </CardContent>      
    </Card>
);

export default Login;
