import React from 'react';
import Hacker from '../HackerListItem';

class HackerList extends React.Component {
  // Match each user with a decision based on the unique object ids (which are the GitHub usernames)
  mergeHackerInfoLists = (usersList, decisions) => {
    return decisions.map((decision) => (
      ({ ...usersList.find((user) => (user.id === decision.id) && decision), ...decision })
    ));
  }

  render() {
    return (
      <table className="student-list"><tbody>
          {this.mergeHackerInfoLists(this.props.usersList, this.props.decisions).map((hacker) => (
            <tr key={hacker.id}><td>
              <Hacker github={hacker.id} firstName={hacker.firstName} lastName={hacker.lastName} status={hacker.status} />
            </td></tr>
          ))}
      </tbody></table>
    );
  }
}

export default HackerList;
