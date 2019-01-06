import React from 'react';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CardMedia from '@material-ui/core/CardMedia';

import './styles.css';
import logo from '../../assets/logo.png';

import { saveAnnouncement } from '../../services/announcement/actions';

class Announcements extends React.Component {
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

                  let announcement_card = document.getElementById("announcement-card");
                  announcement_card.style.display = "none";

                  let confirm_card = document.getElementById("confirm-card");
                  confirm_card.style.display = "block";

                  let text = document.getElementById("announcement").value;

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
                  console.log("Sent Announcement hypothetically");
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
  announcement: state.announcement
});

const mapDispatchToProps = (dispatch) => ({
  saveAnnouncement: (message) => dispatch(saveAnnouncement(message)),
});


export default (connect(mapStateToProps, mapDispatchToProps)(Announcements));
