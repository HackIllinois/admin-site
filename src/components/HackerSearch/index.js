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
      <ListItemText primary={props.name} secondary={props.date} />
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
  filter = (hackers) => {
    if (!this.props.filter) {
      return hackers;
    }
    return hackers.filter(
      hacker =>
        hacker.toLowerCase().indexOf(this.props.filter.toLowerCase()) >= 0
    );
  }

  render() {
    return (
      <ul className="student-list">
        {this.filter(this.props.hackers).map((hackerName) => (
          <Hacker name={hackerName} date="Feb 24, 2019" />
        ))}
      </ul>
    );
  }
}

class HackerSearch extends React.Component {
  constructor() {
    super();
    const HACKERS = [
      "Elia Larkey",
      "Joyce Bearce",
      "Clint Strahan",
      "Maude Defrank",
      "Soila Hendren",
      "Eliana Carrales",
      "Marquerite Bettes",
      "Mikaela Authement",
      "Elyse Toscano",
      "Ginette Solomon",
      "Wanita Sprinkle",
      "Yen Hagans",
      "Annmarie Schaper",
      "Gregg Wilkins",
      "Eura Prue",
      "Addie Madding",
      "Tameika Murph",
      "Keenan Woolsey",
      "Hertha Hyer",
      "Sharan Letsinger"
    ];

    this.state = {
      hackers: HACKERS,
      filter: ""
    };
  }

  updateSearch = (inputValue) => {
    this.setState({
      filter: inputValue
    });
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
          hackers={this.state.hackers}
        />
      </div>
    );
  }
}

export default HackerSearch;
