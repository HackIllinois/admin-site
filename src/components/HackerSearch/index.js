import React from 'react';
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
      <ListItemText primary={props.firstname} secondary={props.lastname} />
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
  parseHackers = (hackers) => {
    console.log(hackers);
    if (!hackers) {
      return [];
    }
    return hackers;
  }

  render() {
    return (
      <ul className="student-list">
        {this.parseHackers(this.props.hackers).map((hacker) => (
          <Hacker name={hacker.firstname} date={hacker.lastname} />
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
          hackers={this.props.decisions}
        />
      </div>
    );
  }
}

export default HackerSearch;
