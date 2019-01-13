import React from 'react';
import { connect } from 'react-redux';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';

const Hacker = (props) => (
  <ListItem>
    <Avatar>
      <ImageIcon />
    </Avatar>
    <ListItemText primary={props.id} secondary={props.status.toString()} />
  </ListItem>
);
  
class HackerFilter extends React.Component {
  handleChange = (event) => {
    this.props.updateSearch(event.target.value);
  }

  render() {
    return (
      <div className="flexbox-center" id="search">
        <SearchIcon id="search-icon" />
        <InputBase
          placeholder="Search…"
          onChange={this.handleChange} 
          value={this.props.searchText}
          fullWidth={true}
        />
      </div>
    );
  }
}

class HackerList extends React.Component {
  render() {
    return (
      <ul className="student-list">
        {console.log(this.props.usersList)}
        {this.props.decisions.map((decision) => (
          <Hacker key={decision.id} id={decision.id} status={decision.finalized} />
        ))}
      </ul>
    );
  }
}

class HackerSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: ""
    };
  }

  updateSearch = (inputValue) => {
    this.setState({
      filter: inputValue
    });
    this.props.filterListener(inputValue);
  }

  render() {
    return (
      <div className="app">
        <HackerFilter
          updateSearch={this.updateSearch}
          searchText={this.state.filter}
        />
        <HackerList
          filter={this.state.filter}
          decisions={this.props.decisions}
          usersList={this.props.usersList}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  decisions: state.decision.decisions,
  usersList: state.registration.usersList,
});

export default connect(mapStateToProps)(HackerSearch);