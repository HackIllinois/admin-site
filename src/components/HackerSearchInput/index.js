import React from 'react';
import ReactDOM from 'react-dom';

import { withStyles } from "@material-ui/core/styles";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';

const styles = {
  formControl: {
    minWidth: 120,
  }
};

class HackerSearchInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hackerId: "",
      wave: 0,
      labelWidth: 0,
    }
  }

  componentDidMount() {
    this.setState({
      labelWidth: ReactDOM.findDOMNode(this.InputLabelRef).offsetWidth
    });
  }

  handleHackerIdChange = (event) => {
    this.setState({
      hackerId: event.target.value,
    });
    this.props.filterListener(event.target.value, this.state.wave);
  }

  handleWaveChange = (event) => {
    this.setState({
      wave: parseInt(event.target.value, 10),
    });
    this.props.filterListener(this.state.hackerId, parseInt(event.target.value, 10));
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className="flexbox-center" id="search">
          <SearchIcon id="search-icon" />
          <InputBase
            placeholder="Search…"
            onChange={this.handleHackerIdChange} 
            value={this.state.searchText}
            fullWidth={true}
          />
        </div>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel
              ref={ref => {
              this.InputLabelRef = ref;
              }}
          >
              Wave
          </InputLabel>
          <Select
            value={this.state.wave}
            onChange={this.handleWaveChange}
            input={<OutlinedInput labelWidth={this.state.labelWidth} name="wave" />}
          >
            <MenuItem value={0}><em>Any</em></MenuItem>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }
}

export default withStyles(styles)(HackerSearchInput);
