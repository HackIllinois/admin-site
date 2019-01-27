import React from 'react';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CardMedia from '@material-ui/core/CardMedia';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import './styles.css';
import logo from '../../assets/logo.png';

import { saveAnnouncement, getNotification, updateSelectedNotification, sendAnnouncement } from '../../services/announcement/actions';

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder',
];

const selected = {topic: ''};

class Announcements extends React.Component {
  componentDidMount() {
    const { getNotification, jwt, } = this.props;
    if (jwt) {
      getNotification(jwt);
    }
    const topics = this.props.announcement.topics;
  }

  render() {
    return (
      <div className="flexbox-center" id="card-container">
        <Card id="announcement-card">
          <CardMedia
            className="center"
            id="card-logo"
            image={logo}
            title="HackIllinois"
          />

          <div className="flexbox-center">
            <FormControl className="select">
              <InputLabel htmlFor="select-multiple">Name</InputLabel>
              <Select
                value={selected.topic}
                onChange={(event) => {
                  const topic = event.target.value;
                  selected.topic = topic;
                  this.props.updateNotification(selected.topic);
                }}>
                {names.map(name => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <CardContent id="card-content">
            <div id="card-form">
              <TextField
                id="announcement"
                label="Announcements"
                name="announcements"
                className="center text-fields"
                margin="normal"
                variant="outlined"
                multiline={true}
                rowsMax={12}
              />

              <Button className="center" id="send" variant="contained" color="primary"
                onClick={() => {

                  let text = document.getElementById("announcement").value;

                  if (this.props.announcement.selectedTopic === '' || text.trim() === ''){
                    return;
                  }

                  let announcement_card = document.getElementById("announcement-card");
                  announcement_card.style.display = "none";

                  let confirm_card = document.getElementById("confirm-card");
                  confirm_card.style.display = "block";


                  this.props.saveAnnouncement(text);
                }}>
                Send Announcement
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card id="confirm-card">
          <CardMedia
            className="center"
            id="card-logo"
            image={logo}
            title="HackIllinois"
          />

          <CardContent id="card-content">
            <div id="card-form">
              <Button className="center" id="view" variant="contained" color="primary"
                onClick={() => {
                  let announcement_card = document.getElementById("announcement-card");
                  announcement_card.style.display = "block";

                  let confirm_card = document.getElementById("confirm-card");
                  confirm_card.style.display = "none";

                  document.getElementById("announcement").focus();
                }}>
                Review
              </Button>

              <Button className="center" id="confirm" variant="contained" color="secondary"
                onClick={() => {
                  const message = this.props.announcement.announcement;
                  const topic = this.props.announcement.selectedTopic;
                  const jwt = this.props.jwt;
                  this.props.sendAnnouncement(message, topic, jwt);
                  document.getElementById("view").click();

                  document.getElementById("announcement").focus();
                }}>
                Confirm Announcement
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    )

  }
}


const mapStateToProps = (state) => ({
  jwt: state.auth.jwt,
  announcement: state.announcement,
});

const mapDispatchToProps = (dispatch) => ({
  saveAnnouncement: (message) => dispatch(saveAnnouncement(message)),
  getNotification: (token) => dispatch(getNotification(token)),
  updateNotification: (notification) => dispatch(updateSelectedNotification(notification)),
  sendAnnouncement: (announcement, topic, token) => dispatch(sendAnnouncement(announcement, topic, token))
});


export default (connect(mapStateToProps, mapDispatchToProps)(Announcements));
