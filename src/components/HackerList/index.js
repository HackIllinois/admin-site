import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";

import HackerListItem from '../HackerListItem';
import HackerListPagination from '../HackerListPagination';

const styles = (theme) => ({
  root: {
    width: "100%",
    marginTop: theme.spacing.unit * 3
  },
  table: {
    minWidth: 500
  },
  tableWrapper: {
    overflowX: "auto"
  }
});

class HackerList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      rowsPerPage: 10,
    }
  }

  // Match each user with a decision based on the unique object ids (which are the GitHub usernames)
  mergeHackerInfoLists = (usersList, decisions) => {
    return decisions.map((decision) => (
      ({ ...usersList.find((user) => (user.id === decision.id) && decision), ...decision })
    ));
  }

  handleChangePage = (event, page) => {
    this.setState({ page: page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const { rowsPerPage, page } = this.state;
    const hackerInfo = this.mergeHackerInfoLists(this.props.usersList, this.props.decisions);
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, hackerInfo.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <TableBody>      
              {hackerInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((hacker) => (
                <TableRow key={hacker.id}>
                  <TableCell component="th" scope="row">
                    <HackerListItem 
                        firstName={hacker.firstName} 
                        lastName={hacker.lastName} 
                        github={hacker.id} 
                        status={hacker.status} 
                      />
                  </TableCell>
                  <TableCell align="center">{hacker.status}</TableCell>               
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 50 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell>
                <TablePagination
                  rowsPerPageOptions={[1, 5, 10, 25]}
                  component="div"
                  count={hackerInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  backIconButtonProps={{
                    'aria-label': 'Previous Page',
                  }}
                  nextIconButtonProps={{
                    'aria-label': 'Next Page',
                  }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  ActionsComponent={HackerListPagination}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
          </Table>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(HackerList);
